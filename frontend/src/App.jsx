import React, { lazy, Suspense, memo, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import AdminRoute from "./components/AdminRoute";

// ── Lazy-loaded route pages ──────────────────────────────────────────────────
// Each page becomes a separate JS chunk that is only fetched when navigated to.
const Home          = lazy(() => import("./pages/Home"));
const Products      = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout      = lazy(() => import("./pages/Checkout"));
const Auth          = lazy(() => import("./pages/Auth"));
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const AdminDashboard= lazy(() => import("./pages/AdminDashboard"));

// ── Full-screen loading fallback ─────────────────────────────────────────────
const PageLoader = memo(() => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-purple-500 animate-spin" />
      <p className="text-zinc-500 text-sm font-medium">Loading...</p>
    </div>
  </div>
));

// ── App ──────────────────────────────────────────────────────────────────────
// LazyMotion with domAnimation loads only the essential Framer Motion features
// (~14 kb) instead of the full bundle (~50 kb). All `motion.*` components in
// child trees must use the m.* equivalents or import from `framer-motion/m`.
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-black font-sans">
        <Navbar />
        <CartDrawer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                  element={<Home />} />
            <Route path="/products"          element={<Products />} />
            <Route path="/products/:slug"    element={<ProductDetail />} />
            <Route path="/checkout"          element={<Checkout />} />
            <Route path="/auth"              element={<Auth />} />
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </LazyMotion>
  );
}

export default memo(App);
