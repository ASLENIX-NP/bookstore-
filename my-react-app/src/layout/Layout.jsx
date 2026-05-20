import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // HEARTBEAT EFFECT: Pings server every 60 seconds to keep user status "Online"
  useEffect(() => {
    if (user && user._id) {
      const pingServer = async () => {
        try {
          await axios.post('http://localhost:5000/api/users/ping', { userId: user._id });
        } catch (err) {
          console.error("Failed to update status:", err);
        }
      };

      pingServer();
      const interval = setInterval(pingServer, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  const isAuthenticated = Boolean(token);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/location', label: 'Location' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('rememberMe');
    setToken(null);
    setUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleCartClick = () => {
    if (!localStorage.getItem('token')) {
      alert('Please login first to view your cart!');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/cart');
  };

  const cartCount = (() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    } catch { return 0; }
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-semibold text-gray-900">PatraPatrika Center</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className={`text-sm font-medium transition-colors ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button type="button" onClick={handleCartClick} className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                )}
              </button>

              <div className="hidden md:block relative">
                {isAuthenticated ? (
                  <>
                    <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer">
                      <User className="w-6 h-6" />
                      <span className="text-sm font-medium">{user?.name || 'User'}</span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 font-semibold flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        <button type="button" onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                )}
              </div>

              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-indigo-600 cursor-pointer">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`block py-2 text-sm font-medium ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-600'}`}>
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 mb-2"><p className="text-sm font-medium">{user?.name}</p></div>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-amber-600">Admin Dashboard</Link>
                    )}
                    <button type="button" onClick={handleLogout} className="block w-full text-left py-2 text-sm font-medium text-gray-600">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-indigo-600">Login</Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow"><Outlet /></main>

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><BookOpen className="w-6 h-6 text-indigo-400" /> <span className="text-lg font-semibold">PatraPatrika Center</span></div>
              <p className="text-gray-400 text-sm">Your one-stop shop for books, notebooks, and quality stationery.</p>
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
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hours</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mon-Fri: 9am-8pm</li>
                <li>Sat: 10am-6pm</li>
                <li>Sun: 11am-5pm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">&copy; 2026 PatraPatrika Center. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}