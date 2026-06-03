import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  LogOut,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
  PackageCheck,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [reviewNotification, setReviewNotification] =
    useState(null);
  
  const [showReviewPopup, setShowReviewPopup] =
    useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    let storedUser = null;

    try {
      const rawUser = localStorage.getItem("user");
      storedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch {
      storedUser = null;
    }

    setToken(storedToken);
    setUser(storedUser);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.email) return;
  
        const res = await axios.get(
          `http://localhost:5000/api/notifications/${user.email}`
        );
  
        const notifications = res.data || [];
  
        const unreadReview =
          notifications.find(
            (n) =>
              n.type === "review" &&
              !n.isRead
          );
  
        if (unreadReview) {
          setReviewNotification(
            unreadReview
          );
  
          setShowReviewPopup(true);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchNotifications();
  }, [user]);

  const isAuthenticated = Boolean(token);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/location", label: "Location" },
    { path: "/about", label: "About Us" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("rememberMe");

    setToken(null);
    setUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    window.dispatchEvent(new Event("storage"));

    navigate("/");
  };

  const handleCartClick = () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      toast.error("Please login first to view your cart!");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    navigate("/cart");
  };

  const handleMyOrdersClick = () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      toast.error("Please login first to view your orders!");
      navigate("/login", { state: { from: "/my-orders" } });
      return;
    }

    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/my-orders");
  };

  const getCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      return cart.reduce(
        (total, item) => total + Number(item.quantity || item.qty || 1),
        0
      );
    } catch {
      return 0;
    }
  };

  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
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

            <nav className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full p-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                    isActive(item.path)
                      ? "bg-slate-950 text-white shadow-md"
                      : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">

              <button
                type="button"
                onClick={handleCartClick}
                className="relative w-11 h-11 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[11px] font-black rounded-full min-w-5 h-5 px-1 flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="hidden md:block relative">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 px-3 py-2 rounded-2xl transition-all shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>

                      <span className="hidden xl:block text-sm font-black max-w-32 truncate">
                        {user?.name || user?.email || "User"}
                      </span>

                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-slate-200/80 py-3 border border-slate-100 z-50 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                          <p className="text-sm font-black text-slate-950 truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {user?.email || "Customer account"}
                          </p>
                        </div>

                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-5 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-black flex items-center gap-3 block"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>

                        <button
                          type="button"
                          onClick={handleMyOrdersClick}
                          className="w-full px-5 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-black flex items-center gap-3"
                        >
                          <PackageCheck className="w-4 h-4" />
                          My Orders
                        </button>

<Link
  to="/wishlist"
  onClick={() => setUserMenuOpen(false)}
  className="w-full px-5 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-black flex items-center gap-3 block"
>
  <Heart className="w-4 h-4" />
  Wishlist
</Link>
                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-5 py-3 text-left text-sm text-amber-600 hover:bg-amber-50 font-black flex items-center gap-3"
                          >
                            
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50 font-black flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-sm font-black shadow-md shadow-indigo-200 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-2xl text-sm font-black ${
                    isActive(item.path)
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 text-sm font-black"
                >
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-black flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full px-4 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <>
  {showReviewPopup &&
    reviewNotification && (

      <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">

            <PackageCheck className="w-8 h-8 text-green-600" />

          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Delivery Completed
          </h2>

          <p className="text-gray-600 mb-6">
            Your order has been delivered successfully.
            Please review your purchased product.
          </p>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setShowReviewPopup(
                  false
                )
              }
              className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold"
            >
              Later
            </button>

            <button
              onClick={async () => {
                try {
                  await axios.patch(
                    `http://localhost:5000/api/notifications/${reviewNotification._id}/read`
                  );

                  setShowReviewPopup(
                    false
                  );

                  navigate(
                    `/products/${reviewNotification.productId}`
                  );
                } catch (error) {
                  console.error(error);
                }
              }}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Review Now
            </button>

          </div>

        </div>

      </div>
    )}

  <main className="flex-1">
    <Outlet />
  </main>
</>

      <footer className="bg-slate-950 text-white mt-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">
      <div className="md:justify-self-start max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>

          <div>
            <p className="font-black text-xl sm:text-2xl">
              PatraPatrika Center
            </p>
            <p className="text-sm text-slate-400 font-bold">
              Books • Stationery • Reading Culture
            </p>
          </div>
        </div>

        <p className="text-base text-slate-400 mt-4 leading-relaxed">
          A clean and trusted destination for books, stationery, and learning
          essentials.
        </p>
      </div>

      <div className="md:justify-self-center md:min-w-[180px] md:translate-x-10 lg:translate-x-14">
        <p className="font-black mb-4 text-lg sm:text-xl">Quick Links</p>

        <div className="space-y-2 text-base text-slate-400">
          <Link to="/products" className="block hover:text-amber-300">
            Products
          </Link>

          <Link to="/location" className="block hover:text-amber-300">
            Location
          </Link>

          <Link to="/about" className="block hover:text-amber-300">
            About Us
          </Link>

          <Link to="/contact" className="block hover:text-amber-300">
            Contact
          </Link>
        </div>
      </div>

      <div className="md:justify-self-end md:min-w-[260px]">
        <p className="font-black mb-4 text-lg sm:text-xl">Store Promise</p>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-base font-black text-amber-300">
          <Sparkles className="w-5 h-5" />
          Quality books. Reliable service.
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 mt-10 pt-6 relative">
      <p className="text-sm text-slate-500 text-center">
        © {new Date().getFullYear()} PatraPatrika Center. All rights reserved.
      </p>

      <div className="mt-4 sm:mt-0 flex items-center justify-center sm:justify-end gap-5 text-sm text-slate-400 sm:absolute sm:right-0 sm:top-6">
        <Link
          to="/policies/terms"
          className="hover:text-amber-300 transition"
        >
          Terms
        </Link>

        <Link
          to="/policies/privacy"
          className="hover:text-amber-300 transition"
        >
          Privacy
        </Link>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}