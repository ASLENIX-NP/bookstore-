import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
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
            <p className="text-sm text-gray-500 font-medium">Sign in to your account</p>
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
                  placeholder="you@example.com"
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

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all duration-200"
            >
              Sign in
            </button>
          </form>

          {/* Redirect link */}
          <p className="text-center text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up
            </Link>
          </p>

          {/* Back to Store Anchor */}
          <div className="pt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={16} />
              Back to store
            </Link>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Brand Purple Banner Column */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Fixed string definition here */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" />

        <div className="relative text-center max-w-md space-y-4 z-10">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome to BookStore
          </h1>
          <p className="text-indigo-100 text-base lg:text-lg font-medium leading-relaxed opacity-90">
            Your one-stop shop for books, notebooks, and premium stationery.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;