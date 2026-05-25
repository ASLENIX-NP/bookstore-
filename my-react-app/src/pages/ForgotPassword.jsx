import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Swal from "sweetalert2";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const role =
    searchParams.get("role") || "customer";

  const isAdmin = role === "admin";

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all fields",
      });

      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email: email.trim().toLowerCase(),
          newPassword: password,
          role,
        }
      );

      Swal.fire({
        icon: "success",
        title: response.data.message,
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title:
          error.response?.data?.message ||
          "Password reset failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-10 ${
        isAdmin
          ? "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]"
          : "bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe]"
      }`}
    >
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        
        {/* LEFT SIDE */}
        <div
          className={`hidden lg:flex flex-col justify-between p-12 relative overflow-hidden ${
            isAdmin
              ? "bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#312e81]"
              : "bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#6366f1]"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                🔐
              </div>

              <div>
                <h2 className="text-white font-black text-2xl">
                  PatraPatrika
                </h2>

                <p className="text-indigo-200 text-sm tracking-[0.3em] font-bold uppercase">
                  Center
                </p>
              </div>
            </div>

            <div className="mt-20">
              <div className="inline-flex px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-black tracking-[0.18em] uppercase">
                {isAdmin
                  ? "Admin Security"
                  : "Customer Security"}
              </div>

              <h1 className="text-white text-6xl font-black leading-tight mt-8">
                Reset your password safely.
              </h1>

              <p className="text-indigo-100 text-lg mt-8 max-w-lg leading-relaxed">
                {isAdmin
                  ? "Securely recover your admin dashboard access and continue managing your bookstore."
                  : "Create a brand new password to continue shopping, ordering, and tracking your books."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-white font-bold">
                Secure
              </h3>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-bold">
                Fast
              </h3>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
              <div className="text-3xl mb-3">🔑</div>
              <h3 className="text-white font-bold">
                Protected
              </h3>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 lg:p-14 bg-white">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-black text-indigo-600 mb-8"
          >
            ← Back to login
          </button>

          <div
            className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-black tracking-[0.18em] uppercase mb-6 ${
              isAdmin
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {isAdmin
              ? "Admin Password Reset"
              : "Customer Password Reset"}
          </div>

          <h1 className="text-5xl font-black text-slate-900 leading-tight">
            Forgot Password
          </h1>

          <p className="text-slate-500 text-lg mt-4 mb-10">
            Enter your email and create a new secure password.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-[0.15em]">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-16 rounded-3xl border border-slate-200 bg-slate-50 px-6 text-lg outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-[0.15em]">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full h-16 rounded-3xl border border-slate-200 bg-slate-50 px-6 text-lg outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-[0.15em]">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Retype password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full h-16 rounded-3xl border border-slate-200 bg-slate-50 px-6 text-lg outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-16 rounded-3xl text-white font-black text-xl transition-all duration-300 shadow-xl ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : isAdmin
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02]"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02]"
              }`}
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;