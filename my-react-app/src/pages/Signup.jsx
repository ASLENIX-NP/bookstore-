import React, { useState } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Loader2,
  UserPlus,
  ShoppingCart,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMsg("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response.data;

      if (data.success === false) {
        setError(data.message || "Signup failed.");
        return;
      }

      setSuccessMsg("Account created successfully. Redirecting to login...");

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Signup failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-4 overflow-hidden">
      <div className="w-full max-w-5xl h-auto lg:h-[92vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-300/60 border border-white overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT FORM PANEL */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-700 transition-colors mb-4"
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-3 border bg-indigo-50 text-indigo-700 border-indigo-100">
                <UserPlus className="w-3.5 h-3.5" />
                Create an Account
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
                Sign up
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Create your customer account to shop, checkout, and track orders.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl text-sm font-bold mb-4">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-3 rounded-2xl text-sm font-bold mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-1.5">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="your full name"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-1.5">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="minimum 6 characters"
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

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-1.5">
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="repeat password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm font-bold text-slate-600 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-black text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT DESIGN PANEL */}
        <div className="hidden lg:flex relative bg-slate-950 text-white p-10 flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80')] bg-cover bg-center opacity-20" />
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
              <UserPlus className="w-4 h-4" />
              New Customer
            </div>

            <h2 className="text-5xl font-black leading-tight">
              Start your bookstore journey.
            </h2>

            <p className="text-slate-300 mt-5 leading-relaxed max-w-md">
              Create an account to save your cart, place orders, track status,
              cancel pending orders, and access VAT invoices.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <ShoppingCart className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Cart</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <PackageCheck className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Orders</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <ReceiptText className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Invoice</p>
            </div>
          </div>

          <div className="relative z-10 bg-white/10 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>

            <div>
              <p className="text-sm font-black">Secure customer account</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your account helps protect checkout, order tracking, and invoice
                access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}