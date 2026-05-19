import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Location from "./pages/Location";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";

// ADMIN PANEL IMPORTS
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBooks from "./pages/ManageBooks";
import Reports from "./pages/Reports";
import ManageOrders from "./pages/ManageOrders";
import ManageUsers from "./pages/ManageUsers";
import AdminSettings from "./pages/Settings";
import ManageMessages from "./pages/ManageMessages"; // <-- 1. IMPORT YOUR NEW MESSAGES COMPONENT HERE

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER SIDE ROUTES */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="location" element={<Location />} />
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ADMIN PANEL ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<ManageMessages />} /> {/* <-- 2. ADDED THE MESSAGES ROUTE HERE */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}