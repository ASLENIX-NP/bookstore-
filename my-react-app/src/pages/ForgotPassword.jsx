import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Mail,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const routeIsAdmin = location.pathname.includes("admin-forgot-password");
  const queryRole = searchParams.get("role");

  const role = routeIsAdmin || queryRole === "admin" ? "admin" : "customer";
  const isAdmin = role === "admin";

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!cleanEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://bookstore-f3if.onrender.com/api/auth/forgot-password/send-otp",
        {
          email: cleanEmail,
          role,
        }
      );

      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: response.data.message,
        confirmButtonColor: isAdmin ? "#f59e0b" : "#4f46e5",
      });

      setStep(2);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "OTP Send Failed",
        text:
          error.response?.data?.message ||
          "Could not send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      Swal.fire({
        icon: "warning",
        title: "OTP required",
        text: "Please enter the OTP sent to your email.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://bookstore-f3if.onrender.com/api/auth/forgot-password/verify-otp",
        {
          email: cleanEmail,
          role,
          otp: otp.trim(),
        }
      );

      Swal.fire({
        icon: "success",
        title: "OTP Verified",
        text: response.data.message,
        confirmButtonColor: isAdmin ? "#f59e0b" : "#4f46e5",
      });

      setStep(3);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text:
          error.response?.data?.message ||
          "OTP verification failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all fields",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Password must be at least 6 characters.",
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
        "https://bookstore-f3if.onrender.com/api/auth/forgot-password/reset",
        {
          email: cleanEmail,
          role,
          otp: otp.trim(),
          newPassword: password,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful",
        text: response.data.message,
        confirmButtonColor: isAdmin ? "#f59e0b" : "#4f46e5",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text:
          error.response?.data?.message ||
          "Password reset failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!cleanEmail) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "https://bookstore-f3if.onrender.com/api/auth/forgot-password/send-otp",
        {
          email: cleanEmail,
          role,
        }
      );

      Swal.fire({
        icon: "success",
        title: "OTP Resent",
        text: response.data.message,
        confirmButtonColor: isAdmin ? "#f59e0b" : "#4f46e5",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could not resend OTP",
        text:
          error.response?.data?.message ||
          "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeColor = isAdmin ? "amber" : "indigo";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-5xl h-auto lg:min-h-[88vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-300/60 border border-white overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex relative bg-slate-950 text-white p-10 flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80')] bg-cover bg-center opacity-20" />

          <div
            className={`absolute inset-0 ${
              isAdmin
                ? "bg-gradient-to-br from-slate-950 via-slate-950/90 to-amber-800/85"
                : "bg-gradient-to-br from-slate-950 via-slate-950/90 to-indigo-800/85"
            }`}
          />

          <div className="absolute -top-24 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
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
              <ShieldCheck className="w-4 h-4" />
              {isAdmin ? "Admin Security" : "Customer Security"}
            </div>

            <h1 className="text-5xl font-black leading-tight">
              Reset password with email OTP.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed max-w-md">
              A 6-digit OTP will be sent to your registered email. Password can
              only be changed after OTP verification.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <Mail className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Email</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <KeyRound className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">OTP</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <Lock className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs font-black">Reset</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-indigo-700 transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>

            <div className="mb-5">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-3 border ${
                  isAdmin
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAdmin ? "Admin Password Reset" : "Customer Password Reset"}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                Forgot password
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {step === 1 &&
                  "Enter your registered email address to receive OTP."}
                {step === 2 &&
                  "Enter the 6-digit OTP sent to your email."}
                {step === 3 &&
                  "Create your new password after OTP verification."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`h-2 rounded-full ${
                    step >= item
                      ? isAdmin
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : isAdmin
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                    6-Digit OTP
                  </label>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black tracking-[0.35em] text-slate-800 placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    OTP sent to{" "}
                    <span className="font-black text-slate-700">
                      {cleanEmail}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : isAdmin
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Verify OTP
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={resetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                    New Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <label className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400 mb-2">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Retype new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      ? "bg-slate-400 cursor-not-allowed"
                      : isAdmin
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                OTP expires in 10 minutes. Password will not change until the
                OTP is verified.
              </p>
            </div>

            {!isAdmin && (
              <p className="text-center text-sm font-bold text-slate-600 mt-5">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="font-black text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;