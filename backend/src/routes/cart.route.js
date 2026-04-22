import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getCart, addToCart, removeFromCart, getWishlist, toggleWishlist } from "../controllers/cart.controller.js";

const router = express.Router();

// All interactions require a user to be authenticated
router.use(requireAuth);

// Cart Routes
router.get("/", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);

// Wishlist Routes
router.get("/wishlist", getWishlist);
router.post("/wishlist/toggle", toggleWishlist);

export default router;
