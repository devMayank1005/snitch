import { body, param, validationResult } from "express-validator";

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
 * Validation middleware for user registration
 */
export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must include uppercase, lowercase, number, and special character"
    ),

  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),

  // Updated: international phone support (allows + prefix and 7-15 digits)
  body("contact")
    .trim()
    .matches(/^(\+\d{1,3})?[\s.-]?\d{7,15}$/)
    .withMessage("Invalid phone number format"),

  body("isSeller")
    .optional()
    .isBoolean()
    .withMessage("isSeller must be a boolean"),

  validateRequest,
];

/**
 * Validation middleware for user login
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  validateRequest,
];

/**
 * Validation middleware for email verification
 */
export const validateEmailVerification = [
  param("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .isLength({ min: 64 })
    .withMessage("Invalid token format"),

  validateRequest,
];

/**
 * Validation middleware for password reset request
 */
export const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  validateRequest,
];

/**
 * Validation middleware for password reset confirmation
 */
export const validatePasswordReset = [
  param("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 64 })
    .withMessage("Invalid token format"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must include uppercase, lowercase, number, and special character"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validateRequest,
];

