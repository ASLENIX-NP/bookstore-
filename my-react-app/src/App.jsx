import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./layout/Layout";
import PolicyPage from "./pages/PolicyPage";
import DeliveryUpdate from "./pages/DeliveryUpdate";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Location from "./pages/Location";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist";
import CheckoutDelivery from "./pages/CheckoutDelivery";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Invoice from "./pages/Invoice";
import UserSettings from "./pages/UserSettings";

// ADMIN PANEL IMPORTS
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import HeroSettings from "./pages/HeroSettings";
import ManageBooks from "./pages/ManageBooks";
import POS from "./pages/POS";
import PrintBarcode from "./pages/PrintBarcode";
import Reports from "./pages/Reports";
import ManageOrders from "./pages/ManageOrders";
import ManageUsers from "./pages/ManageUsers";
import AdminSettings from "./pages/Settings";
import ManageMessages from "./pages/ManageMessages";
import VatBillSettings from "./pages/VatBillSettings";

function ProtectedAdminRoute() {
  const adminToken = localStorage.getItem("adminToken");
  const adminUserRaw = localStorage.getItem("adminUser");

  let adminUser = null;

  try {
    adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
  } catch {
    adminUser = null;
  }

  const isAdmin =
    Boolean(adminToken) &&
    String(adminUser?.role || "").toLowerCase() === "admin";

  if (!isAdmin) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    return <Navigate to="/login/admin" replace />;
  }

  return <Outlet />;
}

function PublicAdminLoginRoute() {
  const adminToken = localStorage.getItem("adminToken");
  const adminUserRaw = localStorage.getItem("adminUser");

  let adminUser = null;

  try {
    adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;
  } catch {
    adminUser = null;
  }

  const isAdmin =
    Boolean(adminToken) &&
    String(adminUser?.role || "").toLowerCase() === "admin";

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* CUSTOMER SIDE ROUTES */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="policies/:type" element={<PolicyPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="location" element={<Location />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout/delivery" element={<CheckoutDelivery />} />
          <Route path="checkout/payment" element={<CheckoutPayment />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="invoice/:id" element={<Invoice />} />
        </Route>

        {/* PUBLIC DELIVERY UPDATE ROUTE */}
        <Route path="/delivery-update/:token" element={<DeliveryUpdate />} />

        {/* USER AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ADMIN AUTH ROUTES */}
        <Route path="/login/admin" element={<PublicAdminLoginRoute />} />
        <Route path="/admin/login" element={<Navigate to="/login/admin" replace />} />
        <Route path="/admin-forgot-password" element={<ForgotPassword />} />

        {/* PROTECTED ADMIN PANEL ROUTES */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hero-settings" element={<HeroSettings />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="pos" element={<POS />} />
            <Route path="print-barcode" element={<PrintBarcode />} />
            <Route path="reports" element={<Reports />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="messages" element={<ManageMessages />} />
            <Route path="vat-bill-settings" element={<VatBillSettings />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}