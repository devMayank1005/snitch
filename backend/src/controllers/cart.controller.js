import { UserModel } from "../models/user.model.js";
import Product from "../models/product.model.js";

// --- CART LOGIC ---
export async function getCart(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId);
    let needsHealing = false;

    // Batched Retrieval (Enterprise Optimization)
    const productIds = user.cart.map(item => item.product);
    const liveProducts = await Product.find({ _id: { $in: productIds } }).lean();
    
    // O(1) Lookup Map
    const productMap = {};
    liveProducts.forEach(p => { productMap[p._id.toString()] = p; });

    // 0. Lazy Healer Protocol (Auto-Upgrade Legacy Schema)
    for (let i = user.cart.length - 1; i >= 0; i--) {
        const item = user.cart[i];
        if (!item.priceSnapshot || item.priceSnapshot.amount === undefined) {
            needsHealing = true;
            const live = productMap[item.product.toString()];
            if (!live) {
                // Irrecoverable Legacy Orphan: physically rip it out
                user.cart.splice(i, 1);
            } else {
                // Auto-Hydrate missing guarantees
                user.cart[i].priceSnapshot = { amount: live.price.amount, currency: live.price.currency };
                user.cart[i].attributesSnapshot = live.attributes || {};
                user.cart[i].titleSnapshot = live.title;
                user.cart[i].imageSnapshot = live.images && live.images.length > 0 ? live.images[0].url : '';
                user.cart[i].stockSnapshot = live.stock || 0;
                user.cart[i].parentProductId = live.parentProductId;
            }
        }
    }

    if (needsHealing) {
        // Silently push the repaired array map backing the schema bounds natively!
        await user.save({ validateModifiedOnly: true }); 
    }

    // Revalidation Pipeline (Safely operating on mathematically guaranteed Snapshots)
    const processedCart = user.cart.map(item => {
        const live = productMap[item.product.toString()];
        const cartObj = item.toObject();

        // 1. Ghost Protocol (Deleted Product Handling)
        if (!live) {
            cartObj.isUnavailable = true;
            cartObj.revalidationWarning = "This item is no longer available.";
            cartObj.isValid = false;
            return cartObj;
        }

        cartObj.isValid = true;
        
        // 2. Eventual Consistency Drift Checkers
        if (live.price.amount !== item.priceSnapshot.amount) {
            cartObj.priceDrift = { old: item.priceSnapshot.amount, new: live.price.amount };
            cartObj.revalidationWarning = `Price altered from ${item.priceSnapshot.currency} ${item.priceSnapshot.amount} to ${live.price.currency} ${live.price.amount}. Validating final price at Checkout.`;
        }

        if (live.stock < item.quantity) {
             cartObj.stockDrift = true;
             cartObj.revalidationWarning = cartObj.revalidationWarning 
                ? cartObj.revalidationWarning + " | Insufficient Stock" 
                : "Requested quantity exceeds active inventory.";
        }

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
    const { productId, quantity = 1 } = req.body;
    const user = await UserModel.findById(req.user.userId);

    // 1. Check Idempotency (Variant Only)
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += Number(quantity);
    } else {
      // 2. Retrieve Live Product Data for Snapshot Creation
      const liveProduct = await Product.findById(productId);
      if (!liveProduct) {
          return res.status(404).json({ success: false, message: "Product no longer exists." });
      }

      // 3. Bake the Immutable Snapshot Payload
      user.cart.push({ 
        product: productId, 
        parentProductId: liveProduct.parentProductId,
        quantity,
        priceSnapshot: { amount: liveProduct.price.amount, currency: liveProduct.price.currency },
        attributesSnapshot: liveProduct.attributes || {},
        stockSnapshot: liveProduct.stock || 0,
        titleSnapshot: liveProduct.title,
        imageSnapshot: liveProduct.images && liveProduct.images.length > 0 ? liveProduct.images[0].url : '',
      });
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Securely added to Cart.", cart: user.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { productId } = req.body;
    const user = await UserModel.findById(req.user.userId);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    return res.status(200).json({ success: true, message: "Removed from cart", cart: user.cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// --- WISHLIST LOGIC ---
export async function getWishlist(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId).populate('wishlist');
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
      user.wishlist.splice(index, 1); // remove
    } else {
      user.wishlist.push(productId); // add
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Wishlist updated", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
