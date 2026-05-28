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
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
          role: "admin",
        }
      );

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin/dashboard");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-4">
    <div className="w-full max-w-7xl min-h-[820px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
    <div className="hidden lg:flex relative bg-slate-950 text-white p-20 flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-amber-700/80" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <p className="text-xl font-black">PatraPatrika</p>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">
                  Admin Panel
                </p>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.16em] mb-5">
              <ShieldAlert className="w-4 h-4" />
              Admin Access
            </div>

            <h1 className="text-5xl font-black leading-tight">
              Manage your store.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed max-w-md">
              Secure admin access for products, orders, analytics, and reports.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-10 sm:p-16">
        <div className="w-full max-w-xl">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-amber-700 mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>

            <div className="mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-3 border bg-amber-50 text-amber-700 border-amber-100">
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Login
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                Admin Sign in
              </h2>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl text-sm font-bold mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                  Admin Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin email"
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
    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-800"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
  >
    {showPassword ? (
      <EyeOff className="w-5 h-5" />
    ) : (
      <Eye className="w-5 h-5" />
    )}
  </button>
</div>

<div className="flex justify-end mt-3">
  <Link
    to="/admin-forgot-password"
    className="text-sm font-black text-amber-600 hover:text-amber-500"
  >
    Forgot password?
  </Link>
</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    Sign in as Admin
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;