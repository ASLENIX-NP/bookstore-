import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  PackageCheck,
  ChevronDown,
  Sparkles,
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
      return cart.reduce((total, item) => total + Number(item.quantity || item.qty || 1), 0);
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

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleMyOrdersClick}
                  className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                    isActive("/my-orders")
                      ? "bg-slate-950 text-white shadow-md"
                      : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                  }`}
                >
                  My Orders
                </button>
              )}
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

                        <button
                          type="button"
                          onClick={handleMyOrdersClick}
                          className="w-full px-5 py-3 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-black flex items-center gap-3"
                        >
                          <PackageCheck className="w-4 h-4" />
                          My Orders
                        </button>

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

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleMyOrdersClick}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-black flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  My Orders
                </button>
              )}

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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-white mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                </div>

                <div>
                  <p className="font-black text-lg">PatraPatrika Center</p>
                  <p className="text-xs text-slate-400 font-bold">
                    Books • Stationery • Reading Culture
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                A clean and trusted destination for books, stationery, and
                learning essentials.
              </p>
            </div>

            <div>
              <p className="font-black mb-4">Quick Links</p>

              <div className="space-y-2 text-sm text-slate-400">
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

            <div>
              <p className="font-black mb-4">Store Promise</p>

              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm font-black text-amber-300">
                <Sparkles className="w-4 h-4" />
                Quality books. Reliable service.
              </div>

              <p className="text-xs text-slate-500 mt-5">
                © {new Date().getFullYear()} PatraPatrika Center. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}