import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validatePasswordResetRequest,
  validatePasswordReset,
} from "../validator/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify-email/:token", validateEmailVerification, verifyEmail);

// Token management
router.post("/refresh", refreshAccessToken);

// Password reset
router.post(
  "/request-password-reset",
  validatePasswordResetRequest,
  requestPasswordReset
);
router.post("/reset-password/:token", validatePasswordReset, resetPassword);

// Protected routes
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;