import { 
  setError, 
  setLoading, 
  setUser, 
  setIsAuthenticated, 
  setToken 
} from "../state/auth.slice";

import { register } from "../service/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  async function handleRegister({ email, contact, password, fullname , isSeller = false}) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await register({ email, contact, password, fullname , isSeller});

      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      dispatch(setIsAuthenticated(true));

    } catch (error) {
      dispatch(setError(error.message || "Registration failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    auth
  };
};