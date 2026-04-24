import { UserModel } from "../models/user.model.js";
import { CartModel } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { findProductByIdWithAvailability, applyAvailabilityToProducts } from "../dao/product.dao.js";

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
      stock: Number(variant.availableStock ?? variant.stock) || 0,
      image: effectiveImages?.[0]?.url || "",
      price: effectivePrice,
      variantId: variant._id?.toString(),
    };
  }

  return {
    title: product.title,
    attributes: {},
    stock: Number(product.availableStock ?? product.stock) || 0,
    image: product.images?.[0]?.url || "",
    price: product.price,
    variantId: null,
  };
}

async function repairCartSnapshots(user) {
  const productIds = user.items.map((item) => item.product).filter(Boolean);
  if (!productIds.length) return false;

  const liveProducts = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = {};
  liveProducts.forEach((product) => {
    productMap[product._id.toString()] = product;
  });

  let repaired = false;

  for (let i = user.items.length - 1; i >= 0; i--) {
    const item = user.items[i];
    const liveProduct = productMap[item.product.toString()];

    if (!liveProduct) {
      user.items.splice(i, 1);
      repaired = true;
      continue;
    }

    const liveSelection = resolveLiveSelection(liveProduct, item.variantId);
    if (!liveSelection) {
      user.items.splice(i, 1);
      repaired = true;
      continue;
    }

    const nextItemKey = buildItemKey(item.product.toString(), item.variantId?.toString());
    if (!item.itemKey || item.itemKey !== nextItemKey) {
      user.items[i].itemKey = nextItemKey;
      repaired = true;
    }

    if (!item.priceSnapshot || item.priceSnapshot.amount === undefined || item.priceSnapshot.currency === undefined) {
      user.items[i].priceSnapshot = {
        amount: liveSelection.price.amount,
        currency: liveSelection.price.currency,
      };
      user.items[i].attributesSnapshot = liveSelection.attributes;
      user.items[i].titleSnapshot = liveSelection.title;
      user.items[i].imageSnapshot = liveSelection.image;
      user.items[i].stockSnapshot = liveSelection.stock;
      repaired = true;
    }
  }

  return repaired;
}

function serializeLegacyCartItems(legacyItems = []) {
  return legacyItems
    .filter((item) => item?.product)
    .map((item) => ({
      product: item.product,
      variantId: item.variantId || null,
      itemKey: item.itemKey || buildItemKey(item.product.toString(), item.variantId?.toString()),
      quantity: Math.max(1, Number(item.quantity) || 1),
      priceSnapshot: {
        amount: Number(item.priceSnapshot?.amount) || 0,
        currency: item.priceSnapshot?.currency || "INR",
      },
      attributesSnapshot: toObjectEntries(item.attributesSnapshot),
      stockSnapshot: Number(item.stockSnapshot) || 0,
      titleSnapshot: item.titleSnapshot || "",
      imageSnapshot: item.imageSnapshot || "",
      snapshotCreatedAt: item.snapshotCreatedAt || new Date(),
    }));
}

async function getOrCreateCartDocument(userId) {
  let cart = await CartModel.findOne({ user: userId });
  if (cart) return cart;

  const user = await UserModel.findById(userId).select("cart").lean();
  const migratedItems = serializeLegacyCartItems(user?.cart || []);

  cart = await CartModel.create({ user: userId, items: migratedItems });
  return cart;
}

export async function getCart(req, res) {
  try {
    const cartDoc = await getOrCreateCartDocument(req.user.userId);

    const repaired = await repairCartSnapshots(cartDoc);
    if (repaired) {
      await cartDoc.save({ validateModifiedOnly: true });
    }

    const productIds = cartDoc.items.map((item) => item.product);
    const rawProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const liveProducts = await applyAvailabilityToProducts(rawProducts);
    const productMap = {};
    liveProducts.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    const processedCart = cartDoc.items.map((item) => {
      const liveProduct = productMap[item.product.toString()];
      const cartObj = typeof item.toObject === "function" ? item.toObject() : { ...item };

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

    const cartDoc = await getOrCreateCartDocument(req.user.userId);

    const repaired = await repairCartSnapshots(cartDoc);
    if (repaired) {
      await cartDoc.save({ validateModifiedOnly: true });
    }

    const liveProduct = await findProductByIdWithAvailability(productId);
    if (!liveProduct) {
      return res.status(404).json({ success: false, message: "Product no longer exists." });
    }

    const hasActiveVariants = Array.isArray(liveProduct.variants)
      && liveProduct.variants.some((entry) => entry?.isActive !== false);
    const baseStock = Number(liveProduct.availableStock ?? liveProduct.stock) || 0;

    if (safeQuantity > 0 && !variantId && hasActiveVariants && baseStock <= 0) {
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
    const existingItemIndex = cartDoc.items.findIndex((item) => item.itemKey === itemKey);

    if (existingItemIndex > -1) {
      const currentQty = cartDoc.items[existingItemIndex].quantity;
      const newQuantity = currentQty + safeQuantity;
      const availableNow = Number(liveSelection.stock) || 0;
      const maxAllowedQuantity = currentQty + availableNow;

      if (newQuantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
      }

      if (newQuantity > maxAllowedQuantity) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds stock" });
      }

      cartDoc.items[existingItemIndex].quantity = newQuantity;
      cartDoc.items[existingItemIndex].stockSnapshot = Math.max(0, maxAllowedQuantity - newQuantity);
    } else {
      if (safeQuantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
      }

      const availableNow = Number(liveSelection.stock) || 0;
      if (safeQuantity > availableNow) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds stock" });
      }

      cartDoc.items.push({
        product: productId,
        variantId: liveSelection.variantId || undefined,
        itemKey,
        quantity: safeQuantity,
        priceSnapshot: {
          amount: liveSelection.price.amount,
          currency: liveSelection.price.currency,
        },
        attributesSnapshot: liveSelection.attributes,
        stockSnapshot: Math.max(0, availableNow - safeQuantity),
        titleSnapshot: liveSelection.title,
        imageSnapshot: liveSelection.image,
      });
    }

    await cartDoc.save();

    return res.status(200).json({ success: true, message: "Added to cart", cart: cartDoc.items });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { itemKey, productId } = req.body;
    const cartDoc = await getOrCreateCartDocument(req.user.userId);

    if (itemKey) {
      cartDoc.items = cartDoc.items.filter((item) => item.itemKey !== itemKey);
    } else if (productId) {
      cartDoc.items = cartDoc.items.filter((item) => item.product.toString() !== productId);
    }

    await cartDoc.save();

    return res.status(200).json({ success: true, message: "Removed from cart", cart: cartDoc.items });
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
