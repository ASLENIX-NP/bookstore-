import React from "react";
import { BookOpen, ShoppingCart, Menu, PackageCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const Navbar = () => {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleCartClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to view your cart!");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    navigate("/cart");
  };

  const handleMyOrdersClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to view your orders.");
      navigate("/login", { state: { from: "/my-orders" } });
      return;
    }

    navigate("/my-orders");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-950 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <BookOpen size={24} />
          </div>

          <div className="leading-tight">
            <p className="text-lg sm:text-xl font-black text-slate-950">
              PatraPatrika
            </p>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-500">
              Center
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full p-1">
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Products
          </Link>

          <Link
            to="/location"
            className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Location
          </Link>

          <Link
            to="/about"
            className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Contact
          </Link>

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleMyOrdersClick}
              className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
            >
              My Orders
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleMyOrdersClick}
              className="hidden sm:flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-2xl font-black text-sm transition-all"
              title="My Orders"
            >
              <PackageCheck size={19} />
              <span>Orders</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCartClick}
            className="relative w-11 h-11 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all"
            title="Cart"
          >
            <ShoppingCart size={21} />
          </button>

          <button
            type="button"
            className="md:hidden w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center"
            title="Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;