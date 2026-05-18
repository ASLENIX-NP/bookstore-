import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Menu, X, User, LogOut, LogIn, LayoutDashboard } from 'lucide-react'; // LayoutDashboard icon थपियो

// 1. Commented out the broken import so Vite stops crashing
// import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 2. Temporary Mock Authentication State for your layout template
  // Set isAuthenticated to false to see the "Login" button, or true to see a fake user profile.
  const isAuthenticated = false; 
  const user = { name: "Sudesa", email: "sudesa@example.com" };
  const logout = () => console.log("Logged out");

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/location', label: 'Location' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };


 

  

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      alert("Please login first to view your cart!");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-600" />

              <span className="text-xl font-semibold text-gray-900">PatraPatrika Center</span>

              

            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Icons Tray */}
            <div className="flex items-center gap-4">
              

              {/* Shopping Cart (बदलेर button बनाइयो र सुरक्षा थपियो) */}

             

              <button
                onClick={handleCartClick}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Account Dropdown Desktop Profile Indicator */}
              <div className="hidden md:block relative">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">{user?.name}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        

                        {/* एडमिन प्यानल जाने लिंक - ड्रपडाउन भित्र थपियो */}

                        

                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 font-semibold flex items-center gap-2 border-b border-gray-100"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
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
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>

              {/* Mobile View Drawer Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-indigo-600 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 mb-2">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    

                    {/* मोबाइल मेनुमा पनि एडमिन ड्यासबोर्ड राखियो */}

                    
                  <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-left px-2 py-2 text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-2 mb-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2 py-2 text-sm font-medium text-indigo-600 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Component Space */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer View */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-indigo-400" />

                <span className="text-lg font-semibold">PatraPatrika Center</span>

                

              </div>
              <p className="text-gray-400 text-sm">
                Your one-stop shop for books, notebooks, and quality stationery.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white">Products</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Parijat Marg</li>
                <li>Reading City, RC 12345</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@PatraPatrika Center.com</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hours</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Monday - Friday: 9am - 8pm</li>
                <li>Saturday: 10am - 6pm</li>
                <li>Sunday: 11am - 5pm</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">

            <p>&copy; 2026 PatraPatrika Center. All rights reserved.</p>

            

          </div>
        </div>
      </footer>
    </div>
  );
}