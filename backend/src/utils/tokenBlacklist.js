/**
 * In-memory token blacklist for tracking revoked/logout tokens
 * For production: migrate to Redis
 */

class TokenBlacklist {
  constructor() {
    this.blacklist = new Map();
    this.cleanupInterval = 60 * 60 * 1000; // Clean up every hour
    this.startCleanupJob();
  }

  /**
   * Add token to blacklist
   * @param {string} token - JWT token to revoke
   * @param {Date} expiresAt - When the token expires
   */
  add(token, expiresAt) {
    this.blacklist.set(token, expiresAt);
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} True if blacklisted
   */
  isBlacklisted(token) {
    if (!this.blacklist.has(token)) {
      return false;
    }

    const expiresAt = this.blacklist.get(token);
    if (expiresAt < new Date()) {
      // Token has expired, remove from blacklist
      this.blacklist.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Remove token from blacklist (manual cleanup)
   * @param {string} token - JWT token to remove
   */
  remove(token) {
    this.blacklist.delete(token);
  }

  /**
   * Clear all expired tokens from blacklist
   */
  cleanup() {
    const now = new Date();
    let clearedCount = 0;

    for (const [token, expiresAt] of this.blacklist.entries()) {
      if (expiresAt < now) {
        this.blacklist.delete(token);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      console.log(`[TokenBlacklist] Cleaned up ${clearedCount} expired tokens`);
    }
  }

  /**
   * Start periodic cleanup job
   * Automatically removes expired tokens every hour
   */
  startCleanupJob() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);

    // Initial cleanup on startup
    this.cleanup();
  }

  /**
   * Get blacklist size (debugging)
   * @returns {number} Size of blacklist
   */
  size() {
    return this.blacklist.size;
  }

  /**
   * Clear entire blacklist (use with caution)
   */
  clear() {
    this.blacklist.clear();
    console.log("[TokenBlacklist] Blacklist cleared");
  }
}

// Export singleton instance
export const tokenBlacklist = new TokenBlacklist();
