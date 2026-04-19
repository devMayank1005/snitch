import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router";

const Register = lazy(() => import("../features/auth/pages/Register"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const VerifyEmail = lazy(() => import("../features/auth/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const Dashboard = lazy(() => import("../features/auth/pages/Dashboard"));

const withSuspense = (element) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-700">
        Loading...
      </div>
    }
  >
    {element}
  </Suspense>
);

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/register",
    element: withSuspense(<Register />),
  },
  {
    path: "/login",
    element: withSuspense(<Login />),
  },
  {
    path: "/verify-email/:token",
    element: withSuspense(<VerifyEmail />),
  },
  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPassword />),
  },
  {
    path: "/reset-password/:token",
    element: withSuspense(<ResetPassword />),
  },
  {
    path: "/dashboard",
    element: withSuspense(<Dashboard />),
  },
]);