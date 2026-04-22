import { UserModel } from "../models/user.model.js";

// --- CART LOGIC ---
export async function getCart(req, res) {
  try {
    const user = await UserModel.findById(req.user.userId).populate('cart.product');
    return res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function addToCart(req, res) {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const user = await UserModel.findById(req.user.userId);

    // Check if product exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId && (item.variantId?.toString() === variantId || !variantId)
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, variantId, quantity });
    }

    await user.save();
    return res.status(200).json({ success: true, message: "Added to cart", cart: user.cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { productId, variantId } = req.body;
    const user = await UserModel.findById(req.user.userId);

    user.cart = user.cart.filter(
      (item) => !(item.product.toString() === productId && (item.variantId?.toString() === variantId || !variantId))
    );

    await user.save();
    return res.status(200).json({ success: true, message: "Removed from cart", cart: user.cart });
  } catch (error) {
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
