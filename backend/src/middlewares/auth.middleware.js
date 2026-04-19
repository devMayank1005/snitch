import { verifyAccessToken, decodeToken } from "../utils/tokenUtils.js";
import { tokenBlacklist } from "../utils/tokenBlacklist.js";

/**
 * Verify that user is authenticated with valid access token
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Check if token is blacklisted (revoked)
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again.",
      });
    }

    // Verify token signature and expiry
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      // Token is invalid or expired
      const decodedPayload = decodeToken(token);
      if (decodedPayload && decodedPayload.exp) {
        const isExpired = decodedPayload.exp * 1000 < Date.now();
        if (isExpired) {
          return res.status(401).json({
            success: false,
            message: "Access token expired. Please refresh your token.",
          });
        }
      }
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      id: decoded.userId, // Alias for compatibility
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Check if user's email is verified
 * (Use after requireAuth middleware)
 */
export const isEmailVerified = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // In a real app, you'd fetch from database here
    // For now, we trust the JWT claim or add it in the token

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification check failed",
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (token) {
      // Check blacklist
      if (tokenBlacklist.isBlacklisted(token)) {
        return next(); // Continue without user
      }

      // Verify token
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          id: decoded.userId,
        };
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue without auth on error
  }
};
