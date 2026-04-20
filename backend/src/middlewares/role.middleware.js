import { UserModel } from "../models/user.model.js";

export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const user = await UserModel.findById(userId).select("role");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Only ${requiredRole}s can perform this action`,
        });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};
