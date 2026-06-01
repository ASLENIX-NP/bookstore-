import React, { useEffect, useState } from "react";
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

  const [policies, setPolicies] = useState({});
  const [activePolicy, setActivePolicy] = useState(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);

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
  
    ...(isAuthenticated
      ? [{ path: "/settings", label: "Settings" }]
      : []),
  ];

  const policyFallbacks = {
    terms: {
      key: "terms",
      title: "Terms & Conditions",
      content: "Terms and Conditions content is not available right now.",
    },
    privacy: {
      key: "privacy",
      title: "Privacy Policy",
      content: "Privacy Policy content is not available right now.",
    },
    return: {
      key: "return",
      title: "Return / Refund Policy",
      content: "Return and Refund Policy content is not available right now.",
    },
    shipping: {
      key: "shipping",
      title: "Shipping Policy",
      content: "Shipping Policy content is not available right now.",
    },
    contact: {
      key: "contact",
      title: "Contact Information",
      content: "Contact information is not available right now.",
    },
  };

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

  const openPolicyModal = async (key) => {
    try {
      setPolicyModalOpen(true);
      setPolicyLoading(true);
      setActivePolicy(policies[key] || policyFallbacks[key]);

      let selectedPolicy = policies[key];

      if (!selectedPolicy) {
        const response = await fetch("http://localhost:5000/api/policies");
        const data = await response.json();

        if (!data.success || !Array.isArray(data.policies)) {
          throw new Error("Invalid policy response");
        }

        const policyMap = {};

        data.policies.forEach((policy) => {
          policyMap[policy.key] = policy;
        });

        setPolicies(policyMap);
        selectedPolicy = policyMap[key] || policyFallbacks[key];
      }

      setActivePolicy(selectedPolicy);
    } catch (error) {
      console.error("Policy load error:", error);
      setActivePolicy(policyFallbacks[key]);
      toast.error("Failed to load latest policy content.");
    } finally {
      setPolicyLoading(false);
    }
  };

  const closePolicyModal = () => {
    setPolicyModalOpen(false);
    setActivePolicy(null);
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

<Link
  to="/wishlist"
  className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-500 flex items-center justify-center shadow-md transition-all"
>
  <Heart
    className="w-5 h-5 text-red-500 fill-red-500"
  />
</Link>

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
  <Link
    to="/settings"
    className="block px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-black"
  >
    Settings
  </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <p className="font-black mb-4">Policies</p>

              <div className="space-y-2 text-sm text-slate-400">
                <button
                  type="button"
                  onClick={() => openPolicyModal("terms")}
                  className="block hover:text-amber-300 text-left"
                >
                  Terms & Conditions
                </button>

                <button
                  type="button"
                  onClick={() => openPolicyModal("privacy")}
                  className="block hover:text-amber-300 text-left"
                >
                  Privacy Policy
                </button>

                <button
                  type="button"
                  onClick={() => openPolicyModal("return")}
                  className="block hover:text-amber-300 text-left"
                >
                  Return / Refund Policy
                </button>

                <button
                  type="button"
                  onClick={() => openPolicyModal("shipping")}
                  className="block hover:text-amber-300 text-left"
                >
                  Shipping Policy
                </button>

                <button
                  type="button"
                  onClick={() => openPolicyModal("contact")}
                  className="block hover:text-amber-300 text-left"
                >
                  Contact Info
                </button>
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

      {policyModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                  PatraPatrika Center
                </p>

                <h2 className="text-2xl font-black text-slate-950 mt-1">
                  {activePolicy?.title || "Policy"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePolicyModal}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xl font-black"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {policyLoading ? (
                <p className="text-sm font-bold text-slate-500">
                  Loading policy...
                </p>
              ) : (
                <div className="whitespace-pre-line text-sm leading-7 text-slate-600 font-medium">
                  {activePolicy?.content ||
                    "Policy content is not available right now."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}