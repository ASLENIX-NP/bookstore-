import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    console.log({ 
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(), 
      password,
      role: 'customer' 
    });
    
    setSuccess(true);
    alert("Signup details logged successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* Left Form Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo Heading */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-3xl">
              <BookOpen size={36} strokeWidth={2.5} />
              <span className="text-gray-900 tracking-tight">BookStore</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-gray-500">Join us to discover your next favorite book</p>
          </div>

          {/* Status Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              Account created locally! Ready for database connection.
            </div>
          )}

          {/* Form UI */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 text-white font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer mt-2 shadow-sm"
            >
              Sign up
            </button>
          </form>

          {/* Links Footer */}
          <div className="space-y-3 text-center text-sm font-medium">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </Link>
            </p>
            <div className="pt-2">
              <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-semibold">
                <ArrowLeft size={16} />
                Back to store
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Right Banner Panel */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse bg-purple-400" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse bg-indigo-400" />
        <div className="relative text-center max-w-md space-y-4 z-10">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">Read Anywhere</h1>
          <p className="text-indigo-100 text-base lg:text-lg font-medium leading-relaxed opacity-90">
            Create an account today to get access to thousands of e-books, personalized recommendations, and member-only discounts.
          </p>
        </div>
      </div>

    </div>
  );
}