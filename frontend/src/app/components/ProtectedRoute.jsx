import { useSelector } from "react-redux";
import { Navigate } from "react-router";

/**
 * ProtectedRoute component - wraps routes that require authentication
 * If user is not authenticated, redirects to login
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // If trying to access protected route without being logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // If user is logged in but email not verified (optional check)
  // Uncomment if you want to enforce email verification
  // if (!user.emailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  return children;
}
