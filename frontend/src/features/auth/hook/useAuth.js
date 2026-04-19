import { 
  setError, 
  setLoading, 
  setUser, 
  setIsAuthenticated, 
  setToken 
} from "../state/auth.slice";

import { register,login } from "../service/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  async function handleRegister({ email, contact, password, fullName , isSeller = false}) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await register({ email, contact, password, fullName , isSeller});

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setIsAuthenticated(true));
      
      return { success: true };
    } catch (error) {
      let errorMessage = "Registration failed";
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }
  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await login({ email, password });

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setIsAuthenticated(true));
      
      return { success: true };
    } catch (error) {
      let errorMessage = "Login failed";
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    auth
  };
};