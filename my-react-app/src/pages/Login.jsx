import React, { useState } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  LogIn,
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        role: isAdmin ? "admin" : "customer",
      });

      const data = response.data;

      if (data.success === false) {
        setErrorMsg(data.message || "Login failed.");
        return;
      }

      const token = data.token;
      const userData =
        data.user || {
          email: email.trim().toLowerCase(),
          role: isAdmin ? "admin" : "customer",
        };

      if (!token) {
        setErrorMsg("Login failed. Token was not received from backend.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("email", userData.email || email.trim().toLowerCase());

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      if (userData.role === "admin" || isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login error:", error);

      setErrorMsg(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-4 overflow-hidden">
      <div className="w-full max-w-5xl h-auto lg:h-[92vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-300/60 border border-white overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT DESIGN PANEL */}
        <div className="hidden lg:flex relative bg-slate-950 text-white p-10 flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-indigo-800/80" />
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <p className="text-xl font-black">PatraPatrika</p>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">
                  Center
                </p>
              </div>
            </Link>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.16em] mb-5">
              {isAdmin ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Admin Access
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Customer Access
                </>
              )}
            </div>

            <h1 className="text-5xl font-black leading-tight">
              {isAdmin ? "Manage your store." : "Welcome back, reader."}
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed max-w-md">
              {isAdmin
                ? "Login to manage products, orders, customers, invoices, reports, and store activity."
                : "Login to shop books, save your cart, track your orders, and view invoices."}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <ShoppingBag className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Shop</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <PackageCheck className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Track</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <ShieldCheck className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Secure</p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-700 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>

            <div className="lg:hidden flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>

              <div>
                <p className="text-lg font-black text-slate-950">
                  PatraPatrika
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500">
                  Center
                </p>
              </div>
            </div>

            <div className="mb-5">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-3 border ${
                  isAdmin
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Login
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    Customer Login
                  </>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                Sign in
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {isAdmin
                  ? "Access your admin dashboard securely."
                  : "Continue shopping and tracking your orders."}
              </p>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-1 rounded-2xl grid grid-cols-2 gap-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setIsAdmin(false);
                  setErrorMsg("");
                }}
                className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                  !isAdmin
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdmin(true);
                  setErrorMsg("");
                }}
                className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                  isAdmin
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Admin
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl text-sm font-bold mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdmin ? "admin email" : "your email"}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
  <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-600">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
    />
    Remember me
  </label>

  <button
    type="button"
    onClick={() =>
      navigate(
        isAdmin
          ? "/forgot-password?role=admin"
          : "/forgot-password?role=customer"
      )
    }
    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition"
  >
    Forgot password?
  </button>
</div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : isAdmin
                    ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : isAdmin ? (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    Sign in as Admin
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            {!isAdmin && (
              <p className="text-center text-sm font-bold text-slate-600 mt-5">
                New customer?{" "}
                <Link
                  to="/signup"
                  className="font-black text-indigo-600 hover:text-indigo-500"
                >
                  Create account
                </Link>
              </p>
            )}

            <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure login for cart, checkout, order tracking, delivery
                information, admin dashboard, and invoice access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;