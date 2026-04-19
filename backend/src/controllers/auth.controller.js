import { UserModel } from "../models/user.model.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from "../utils/tokenUtils.js";
import { tokenBlacklist } from "../utils/tokenBlacklist.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../config/emailConfig.js";

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5174";

const issueAuthCookies = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const accessTokenDecoded = decodeToken(accessToken);
  const refreshTokenDecoded = decodeToken(refreshToken);
  const refreshTokenExpiry = new Date(refreshTokenDecoded.exp * 1000);

  await user.addRefreshToken(refreshToken, refreshTokenExpiry);
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: accessTokenDecoded?.exp ? new Date(accessTokenDecoded.exp * 1000) : null,
  };
};

/**
 * Send tokens in response
 * @param {object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Response message
 */
export const sendTokenResponse = async (user, statusCode, res, message) => {
  const { accessToken, refreshToken } = await issueAuthCookies(user, res);

  return res.status(statusCode).json({
    success: true,
    message: message || "Authentication successful",
    data: {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        contact: user.contact,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    },
  });
};

/**
 * Register user with email verification
 */
export const registerUser = async (req, res) => {
  const { email, contact, password, fullName, isSeller } = req.body;
  try {
    // Check if user already exists
    const userExists = await UserModel.findOne({
      $or: [{ email }, { contact }],
    });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already registered",
      });
    }

    // Create new user
    const user = await UserModel.create({
      email,
      contact,
      password,
      fullName,
      role: isSeller ? "seller" : "buyer",
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails, user can resend
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        email: user.email,
        emailVerified: false,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register. Please try again.",
    });
  }
};

/**
 * Verify email address
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Hash the token to match what's in database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token
    const user = await UserModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Send tokens
    return sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find user and check if refresh token exists
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.validateRefreshToken(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found or revoked",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Set new access token in cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

/**
 * Logout user (revoke tokens)
 */
export const logoutUser = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userId = req.user?.id; // From auth middleware

    if (!accessToken && !refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No tokens to revoke",
      });
    }

    // Add access token to blacklist
    if (accessToken) {
      const decoded = decodeToken(accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        tokenBlacklist.add(accessToken, expiresAt);
      }
    }

    // Revoke refresh token from database
    if (refreshToken && userId) {
      const user = await UserModel.findById(userId);
      if (user) {
        user.revokeRefreshToken(refreshToken);
        await user.save();
      }
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If email exists, password reset link has been sent",
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If email exists, password reset link has been sent. Link expires in 1 hour.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Hash the token to match database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    // Revoke all refresh tokens for security
    user.revokeAllRefreshTokens();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

/**
 * Get current user (protected route)
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select(
      "-password -emailVerificationToken -passwordResetToken -refreshTokens"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${getFrontendUrl()}/login?error=google_auth_failed`);
    }

    await issueAuthCookies(user, res);
    return res.redirect(`${getFrontendUrl()}/dashboard`);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(`${getFrontendUrl()}/login?error=google_auth_failed`);
  }
};