import axios from "axios";
import { store } from "../../../app/app.store.js";
import { setToken, setRefreshToken, logout } from "../state/auth.slice.js";

const authApiInstance = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

// Flag to prevent infinite token refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor: Handle token refresh on 401
 */
authApiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return authApiInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        const response = await axios.post(
          "/api/auth/refresh",
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );

        const { data } = response.data;
        const newAccessToken = data.accessToken;

        // Update store
        store.dispatch(setToken(newAccessToken));
        store.dispatch(setRefreshToken(data.refreshToken || refreshToken));

        // Set new token in header
        authApiInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);

        return authApiInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Register user with email verification
 */
export async function register({
  email,
  contact,
  password,
  fullName,
  isSeller,
}) {
  try {
    const response = await authApiInstance.post("/register", {
      email,
      contact,
      password,
      fullName,
      isSeller,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Login user
 */
export async function login({ email, password, rememberMe }) {
  try {
    const response = await authApiInstance.post("/login", {
      email,
      password,
      rememberMe,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token) {
  try {
    const response = await authApiInstance.get(`/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await authApiInstance.post(
      "/refresh",
      refreshToken ? { refreshToken } : {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user (revoke tokens)
 */
export async function logoutUser(refreshToken) {
  try {
    const response = await authApiInstance.post(
      "/logout",
      refreshToken ? { refreshToken } : {}
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Start Google OAuth flow
 */
export function startGoogleAuth() {
  const oauthPath = "/api/auth/google";
  const apiBaseUrl = import.meta.env.VITE_API_URL;

  if (apiBaseUrl) {
    window.location.href = `${apiBaseUrl}${oauthPath}`;
    return;
  }

  // In local dev, Vite proxy forwards /api/* to backend.
  window.location.href = oauthPath;
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email) {
  try {
    const response = await authApiInstance.post("/request-password-reset", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token, newPassword, confirmPassword) {
  try {
    const response = await authApiInstance.post(`/reset-password/${token}`, {
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user (protected)
 */
export async function getCurrentUser() {
  try {
    const response = await authApiInstance.get("/me");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export default authApiInstance;