import { UserModel } from "../models/user.model.js";
import Product from "../models/product.model.js";

function buildItemKey(productId, variantId) {
  return `${productId}:${variantId || "base"}`;
}

function toObjectEntries(mapLike) {
  if (!mapLike) return {};
  if (typeof mapLike.toObject === "function") return mapLike.toObject();
  return { ...mapLike };
}

function resolveLiveSelection(product, variantId) {
  if (!product) return null;

  if (variantId) {
    const variant = (product.variants || []).find(
      (entry) => entry._id?.toString() === variantId.toString()
    );

    if (!variant || variant.isActive === false) {
      return null;
    }

    const effectivePrice = variant.price?.amount !== undefined ? variant.price : product.price;
    const effectiveImages = variant.images?.length ? variant.images : product.images;

    return {
      title: product.title,
      attributes: toObjectEntries(variant.attributes),
      stock: Number(variant.stock) || 0,
      image: effectiveImages?.[0]?.url || "",
      price: effectivePrice,
      variantId: variant._id?.toString(),
    };
  }

  return {
    title: product.title,
    attributes: {},
    stock: Number(product.stock) || 0,
    image: product.images?.[0]?.url || "",
    price: product.price,
    variantId: null,
  };
}

async function repairCartSnapshots(user) {
  const productIds = user.cart.map((item) => item.product).filter(Boolean);
  if (!productIds.length) return false;

  const liveProducts = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = {};
  liveProducts.forEach((product) => {
    productMap[product._id.toString()] = product;
  });

  let repaired = false;

  for (let i = user.cart.length - 1; i >= 0; i--) {
    const item = user.cart[i];
    const liveProduct = productMap[item.product.toString()];

    if (!liveProduct) {
      user.cart.splice(i, 1);
      repaired = true;
      continue;
    }

    const liveSelection = resolveLiveSelection(liveProduct, item.variantId);
    if (!liveSelection) {
      user.cart.splice(i, 1);
      repaired = true;
      continue;
    }

    const nextItemKey = buildItemKey(item.product.toString(), item.variantId?.toString());
    if (!item.itemKey || item.itemKey !== nextItemKey) {
      user.cart[i].itemKey = nextItemKey;
      repaired = true;
    }

    if (!item.priceSnapshot || item.priceSnapshot.amount === undefined || item.priceSnapshot.currency === undefined) {
      user.cart[i].priceSnapshot = {
        amount: liveSelection.price.amount,
        currency: liveSelection.price.currency,
      };
      user.cart[i].attributesSnapshot = liveSelection.attributes;
      user.cart[i].titleSnapshot = liveSelection.title;
      user.cart[i].imageSnapshot = liveSelection.image;
      user.cart[i].stockSnapshot = liveSelection.stock;
      repaired = true;
    }
  }

  return repaired;
}

export async function getCart(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId);

    const repaired = await repairCartSnapshots(user);
    if (repaired) {
      await user.save({ validateModifiedOnly: true });
    }

    const productIds = user.cart.map((item) => item.product);
    const liveProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = {};
    liveProducts.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    const processedCart = user.cart.map((item) => {
      const liveProduct = productMap[item.product.toString()];
      const cartObj = item.toObject();

      if (!liveProduct) {
        cartObj.isUnavailable = true;
        cartObj.revalidationWarning = "This item is no longer available.";
        cartObj.isValid = false;
        return cartObj;
      }

      const liveSelection = resolveLiveSelection(liveProduct, item.variantId);
      if (!liveSelection) {
        cartObj.isUnavailable = true;
        cartObj.revalidationWarning = "This variant is no longer available.";
        cartObj.isValid = false;
        return cartObj;
      }

      cartObj.isValid = true;
      cartObj.itemKey = buildItemKey(item.product.toString(), item.variantId?.toString());

      if (
        liveSelection.price.amount !== item.priceSnapshot?.amount ||
        liveSelection.price.currency !== item.priceSnapshot?.currency
      ) {
        cartObj.priceDrift = {
          old: item.priceSnapshot?.amount,
          new: liveSelection.price.amount,
        };
        cartObj.revalidationWarning = `Price changed from ${item.priceSnapshot?.currency} ${item.priceSnapshot?.amount} to ${liveSelection.price.currency} ${liveSelection.price.amount}.`;
      }

      if (liveSelection.stock < item.quantity) {
        cartObj.stockDrift = true;
        cartObj.revalidationWarning = cartObj.revalidationWarning
          ? `${cartObj.revalidationWarning} | Insufficient stock`
          : "Requested quantity exceeds available stock.";
      }

      cartObj.stockSnapshot = liveSelection.stock;
      return cartObj;
    });

    return res.status(200).json({ success: true, cart: processedCart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function addToCart(req, res) {
  try {
    const { productId, variantId = null, quantity = 1 } = req.body;
    const safeQuantity = Number(quantity);

    if (!Number.isFinite(safeQuantity) || safeQuantity === 0) {
      return res.status(400).json({ success: false, message: "Quantity offset cannot be zero" });
    }

    const user = await UserModel.findById(req.user.userId);

    const repaired = await repairCartSnapshots(user);
    if (repaired) {
      await user.save({ validateModifiedOnly: true });
    }

    const liveProduct = await Product.findById(productId).lean();
    if (!liveProduct) {
      return res.status(404).json({ success: false, message: "Product no longer exists." });
    }

    const hasActiveVariants = Array.isArray(liveProduct.variants)
      && liveProduct.variants.some((entry) => entry?.isActive !== false);
    const baseStock = Number(liveProduct.stock) || 0;

    if (!variantId && hasActiveVariants && baseStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please select an available variation before adding this item to cart.",
      });
    }

    const liveSelection = resolveLiveSelection(liveProduct, variantId);
    if (!liveSelection) {
      return res.status(404).json({ success: false, message: "Variant no longer exists." });
    }

    const itemKey = buildItemKey(productId, liveSelection.variantId || null);
    const existingItemIndex = user.cart.findIndex((item) => item.itemKey === itemKey);

    if (existingItemIndex > -1) {
      const currentQty = user.cart[existingItemIndex].quantity;
      const newQuantity = currentQty + safeQuantity;

      if (newQuantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
      }

      if (newQuantity > liveSelection.stock) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds stock" });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
      user.cart[existingItemIndex].stockSnapshot = liveSelection.stock;
    } else {
      if (safeQuantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
      }

      if (safeQuantity > liveSelection.stock) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds stock" });
      }

      user.cart.push({
        product: productId,
        variantId: liveSelection.variantId || undefined,
        itemKey,
        quantity: safeQuantity,
        priceSnapshot: {
          amount: liveSelection.price.amount,
          currency: liveSelection.price.currency,
        },
        attributesSnapshot: liveSelection.attributes,
        stockSnapshot: liveSelection.stock,
        titleSnapshot: liveSelection.title,
        imageSnapshot: liveSelection.image,
      });
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { itemKey, productId } = req.body;
    const user = await UserModel.findById(req.user.userId);

    if (itemKey) {
      user.cart = user.cart.filter((item) => item.itemKey !== itemKey);
    } else if (productId) {
      user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Removed from cart", cart: user.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getWishlist(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId).populate("wishlist");
    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function toggleWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = await UserModel.findById(req.user.userId);

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Wishlist updated", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
