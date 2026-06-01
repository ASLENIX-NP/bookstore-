import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ShoppingCart,
  Menu,
  Heart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();

    window.addEventListener("storage", updateWishlistCount);

    return () => {
      window.removeEventListener(
        "storage",
        updateWishlistCount
      );
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCartCount(0);
        return;
      }

      const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const totalQty = cart.reduce(
        (sum, item) => sum + (item.qty || 1),
        0
      );

      setCartCount(totalQty);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  const handleCartClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to view your cart!");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    navigate("/cart");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-full px-1 py-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Products
          </Link>

          <Link
            to="/location"
            className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Location
          </Link>

          <Link
            to="/about"
            className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
          >
            Contact
          </Link>

          {isLoggedIn && (
            <Link
              to="/settings"
              className="px-3 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
            >
              Settings
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-500 flex items-center justify-center shadow-md transition-all"
          >
            <Heart
              size={21}
              className={
                wishlistCount > 0
                  ? "fill-red-500 text-red-500"
                  : ""
              }
            />
          </Link>

          {/* Cart */}
          <button
            type="button"
            onClick={handleCartClick}
            className="relative w-11 h-11 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all"
          >
            <ShoppingCart size={21} />

            {isLoggedIn && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            className="md:hidden w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;