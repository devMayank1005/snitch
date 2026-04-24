import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getCart, addToCart, removeFromCart, getWishlist, toggleWishlist } from "../controllers/cart.controller.js";
import { validateAddToCart, validateRemoveFromCart, validateToggleWishlist } from "../validator/cart.validator.js";

const router = express.Router();

// All interactions require a user to be authenticated
router.use(requireAuth);

// Cart Routes
router.get("/", getCart);
router.post("/add", validateAddToCart, addToCart);
router.post("/remove", validateRemoveFromCart, removeFromCart);

// Wishlist Routes
router.get("/wishlist", getWishlist);
router.post("/wishlist/toggle", validateToggleWishlist, toggleWishlist);

export default router;
