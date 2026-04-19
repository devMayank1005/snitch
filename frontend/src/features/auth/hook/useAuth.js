import {
  setError,
  clearError,
  setLoading,
  setUser,
  setIsAuthenticated,
  setToken,
  setRefreshToken,
  setRememberMe,
  logout,
} from "../state/auth.slice.js";

import {
  register,
  login,
  verifyEmail,
  logoutUser,
  requestPasswordReset,
  resetPassword,
} from "../service/auth.api.js";
import { useDispatch, useSelector } from "react-redux";

/**
 * Extract error message from API response
 */
const extractErrorMessage = (error) => {
  if (error.response?.data?.errors && error.response.data.errors.length > 0) {
    return error.response.data.errors[0].msg;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return "An error occurred";
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  /**
   * Register new user
   */
  async function handleRegister({
    email,
    contact,
    password,
    fullName,
    isSeller = false,
  }) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await register({
        email,
        contact,
        password,
        fullName,
        isSeller,
      });

      return {
        success: true,
        message: response.message,
        email: response.data.email,
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Login user
   */
  async function handleLogin({ email, password, rememberMe = false }) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await login({ email, password, rememberMe });

      // Store tokens
      dispatch(setUser(response.data.user));
      dispatch(setToken(response.data.accessToken));
      dispatch(setRefreshToken(response.data.refreshToken));
      dispatch(setIsAuthenticated(true));
      if (rememberMe) {
        dispatch(setRememberMe(true));
      }

      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Verify email with token
   */
  async function handleVerifyEmail(token) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await verifyEmail(token);

      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Request password reset email
   */
  async function handleRequestPasswordReset(email) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await requestPasswordReset(email);

      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Reset password with token
   */
  async function handleResetPassword(token, newPassword, confirmPassword) {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const response = await resetPassword(token, newPassword, confirmPassword);

      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Logout user
   */
  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      
      // Call logout endpoint (non-blocking)
      if (auth.refreshToken) {
        try {
          await logoutUser(auth.refreshToken);
        } catch (error) {
          console.error("Logout request failed:", error);
          // Continue with logout even if API call fails
        }
      }

      // Clear local state
      dispatch(logout());
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logout()); // Force logout anyway
      return { success: true };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleVerifyEmail,
    handleRequestPasswordReset,
    handleResetPassword,
    handleLogout,
    auth,
  };
};