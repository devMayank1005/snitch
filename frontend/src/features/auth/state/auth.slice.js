import { createSlice } from "@reduxjs/toolkit";

// Helper function to load auth state from localStorage
const loadFromLocalStorage = () => {
  try {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error("Failed to load auth from localStorage:", error);
  }

  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    rememberMe: false,
  };
};

// Helper function to save auth state to localStorage
const saveToLocalStorage = (state) => {
  try {
    const stateToSave = {
      user: state.user,
      token: state.token,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      rememberMe: state.rememberMe,
    };
    localStorage.setItem("auth", JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Failed to save auth to localStorage:", error);
  }
};

const initialState = loadFromLocalStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      saveToLocalStorage(state);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      saveToLocalStorage(state);
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      saveToLocalStorage(state);
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      saveToLocalStorage(state);
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
      saveToLocalStorage(state);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.rememberMe = false;
      localStorage.removeItem("auth");
    },
    // Initialize auth state from storage (called on app mount)
    initializeAuth: (state) => {
      const stored = loadFromLocalStorage();
      state.user = stored.user;
      state.token = stored.token;
      state.refreshToken = stored.refreshToken;
      state.isAuthenticated = stored.isAuthenticated;
      state.rememberMe = stored.rememberMe;
      state.loading = false;
    },
  },
});

export const {
  setUser,
  setToken,
  setRefreshToken,
  setIsAuthenticated,
  setRememberMe,
  setLoading,
  setError,
  clearError,
  logout,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;