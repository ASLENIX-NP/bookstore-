import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Location from "./pages/Location";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ADMIN PANEL IMPORTS
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBooks from "./pages/ManageBooks"; 
import ManageOrders from "./pages/ManageOrders"; 
import ManageUsers from "./pages/ManageUsers"; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* CUSTOMER SIDE SITES */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="location" element={<Location />} />
        </Route>

        {/* AUTH WRAPPERS */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ADMIN PANEL ROUTES STRUCTURE */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Automatically redirect base /admin to /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Explicit dashboard route matching your browser address */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}