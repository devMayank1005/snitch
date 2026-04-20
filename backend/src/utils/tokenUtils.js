import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

/**
 * Generate JWT access token (15 minutes expiry)
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.jwtAccessExpiry,
  });
};

/**
 * Generate JWT refresh token (7 days expiry)
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.jwtRefreshExpiry,
  });
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT refresh token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null if invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};
