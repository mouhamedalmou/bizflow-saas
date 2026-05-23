import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SidebarLayout from "./components/SidebarLayout";
import Loader from "./components/Loader";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import { useTheme } from "./hooks/useTheme";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));

function App() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark ? "#0f172a" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#e2e8f0" : "#0f172a",
            boxShadow: isDark
              ? "0 12px 30px rgb(0 0 0 / 0.45)"
              : "0 12px 30px rgb(15 23 42 / 0.12)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Suspense fallback={<Loader label="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/login"
            element={
              <main className="mx-auto max-w-6xl px-4 py-6">
                <Login />
              </main>
            }
          />
          <Route
            path="/register"
            element={
              <main className="mx-auto max-w-6xl px-4 py-6">
                <Register />
              </main>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <SidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          <Route
            element={
              <AdminRoute>
                <SidebarLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>

          <Route path="/admin" element={<Navigate to="/admin/products" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
