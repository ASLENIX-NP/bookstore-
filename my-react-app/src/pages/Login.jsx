import React, { useState } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
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

      const response = await axios.post(
        "https://bookstore-f3if.onrender.com/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
          role: "customer",
        }
      );

      const data = response.data;

      if (data.success === false) {
        setErrorMsg(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("email", data.user?.email);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      navigate(redirectPath);
    } catch (error) {
      console.error("Login error:", error);

      setErrorMsg(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-4 overflow-hidden">
      <div className="w-full max-w-5xl h-auto lg:h-[92vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-300/60 border border-white overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex relative bg-slate-950 text-white p-10 flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-indigo-800/80" />

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
              <LogIn className="w-4 h-4" />
              Customer Access
            </div>

            <h1 className="text-5xl font-black leading-tight">
              Welcome back, reader.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed max-w-md">
              Login to shop books, save your cart, track your orders, and view invoices.
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

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-700 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>

            <div className="mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-3 border bg-indigo-50 text-indigo-700 border-indigo-100">
                <LogIn className="w-3.5 h-3.5" />
                Customer Login
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                Sign in
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Continue shopping and tracking your orders.
              </p>
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
                    placeholder="your email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
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
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="font-black text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm font-bold text-slate-600 mt-5">
              New customer?{" "}
              <Link
                to="/signup"
                className="font-black text-indigo-600 hover:text-indigo-500"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;