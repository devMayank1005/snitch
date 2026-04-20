import { Router } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  googleCallback,
} from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validateResendVerificationEmail,
  validatePasswordResetRequest,
  validatePasswordReset,
} from "../validator/auth.validator.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// ✅ Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);


// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/verify-email/:token", validateEmailVerification, verifyEmail);
router.post(
  "/resend-verification-email",
  validateResendVerificationEmail,
  resendVerificationEmail
);

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