import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Handles customer vs admin state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // This payload sends the role information alongside credentials to your auth backend later
    console.log({ 
      email, 
      password, 
      rememberMe, 
      role: isAdmin ? 'admin' : 'customer' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* LEFT SIDE: Login Form Column */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
        
        {/* Main Content Container */}
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-3xl">
              <BookOpen size={36} strokeWidth={2.5} />
              <span className="text-gray-900 tracking-tight">BookStore</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 font-medium transition-all duration-200">
              {isAdmin ? (
                <span className="text-amber-600 flex items-center justify-center gap-1.5 font-semibold">
                  <ShieldAlert size={16} /> Management Portal Access
                </span>
              ) : (
                "Sign in to your account"
              )}
            </p>
          </div>

          {/* Admin vs Customer Switcher Toggle Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                !isAdmin 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Customer Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                isAdmin 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Admin Access
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? "admin@bookstore.com" : "you@example.com"}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <a href="#forgot" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Dynamic Action Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
                isAdmin 
                  ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" 
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              }`}
            >
              {isAdmin ? "Verify Admin Credentials" : "Sign in"}
            </button>
          </form>

          {/* Conditional Signup Link Wrapper */}
          {!isAdmin && (
            <p className="text-center text-sm font-medium text-gray-600 animate-fadeIn">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign up
              </Link>
            </p>
          )}

          {/* Back to Store Link */}
          <div className="pt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={16} />
              Back to store
            </Link>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Visual Banner Column */}
      <div className={`hidden md:flex md:w-1/2 items-center justify-center p-12 relative overflow-hidden transition-all duration-500 ${
        isAdmin 
          ? "bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500" 
          : "bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500"
      }`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse transition-colors duration-500 ${isAdmin ? "bg-amber-400" : "bg-purple-400"}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse transition-colors duration-500 ${isAdmin ? "bg-orange-400" : "bg-indigo-400"}`} />

        <div className="relative text-center max-w-md space-y-4 z-10">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight transition-all duration-300">
            {isAdmin ? "Control Center" : "Welcome to BookStore"}
          </h1>
          <p className="text-indigo-100 text-base lg:text-lg font-medium leading-relaxed opacity-90 transition-all duration-300">
            {isAdmin 
              ? "Access data logs, track analytics, update stock levels, and coordinate user groups securely." 
              : "Your one-stop shop for books, notebooks, and premium stationery."}
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;