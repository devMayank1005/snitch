import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router";

import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";
import CreateProduct from "../features/products/pages/CreateProduct";
import SellerDashboard from "../features/products/pages/Dashboard";

import AppLayout from "./AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const Register = lazy(() => import("../features/auth/pages/Register"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const VerifyEmail = lazy(() => import("../features/auth/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const AuthDashboard = lazy(() => import("../features/auth/pages/Dashboard"));

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
    element: (
      <ProtectedRoute>
        {withSuspense(<AuthDashboard />)}
      </ProtectedRoute>
    ),
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:productId",
        element: <ProductDetail />
      },
      {
        path: "/seller",
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />
          },
          {
            path: "create-product",
            element: (
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            )
          },
          {
            path: "dashboard",
            element: (
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            )
          },
          {
            path: "product/:productId",
            element: (
              <ProtectedRoute>
                <SellerProductDetails />
              </ProtectedRoute>
            )
          }
        ]
      }
    ]
  }
]);
