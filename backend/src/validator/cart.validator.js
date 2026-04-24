import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
}

/**
 * Validation middleware for adding item to cart
 */
export const validateAddToCart = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid product ID format");
      }
      return true;
    }),

  body("quantity")
    .optional({ checkFalsy: false })
    .isInt()
    .withMessage("Quantity must be an integer")
    .custom((value) => {
      if (value === 0) {
        throw new Error("Quantity cannot be zero");
      }
      return true;
    }),

  body("variantId")
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid variant ID format");
      }
      return true;
    }),

  validateRequest,
];

/**
 * Validation middleware for removing item from cart
 */
export const validateRemoveFromCart = [
  body()
    .custom((value) => {
      const { itemKey, productId } = value;
      if (!itemKey && !productId) {
        throw new Error("Either itemKey or productId is required");
      }
      if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID format");
      }
      return true;
    }),

  body("itemKey")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Item key must be a string"),

  body("productId")
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid product ID format");
      }
      return true;
    }),

  validateRequest,
];

/**
 * Validation middleware for toggling wishlist
 */
export const validateToggleWishlist = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid product ID format");
      }
      return true;
    }),

  validateRequest,
];
