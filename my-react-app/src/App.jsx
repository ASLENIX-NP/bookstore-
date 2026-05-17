import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Location from "./pages/Location";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// ADMIN IMPORTS थपियो
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";

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

        {/* NEW ADMIN PANEL ROUTES STRUCTURE */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* भविष्यमा थपिने एडमिनका अरु पेजहरू (जस्तै म्यानेज अर्डर, युजर्स) यहाँ भित्र राख्न सकिन्छ */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}