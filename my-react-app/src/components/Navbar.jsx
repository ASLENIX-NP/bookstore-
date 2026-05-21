import React from 'react';
import { BookOpen, ShoppingCart, Menu, PackageCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleCartClick = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to view your cart.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    navigate('/cart');
  };

  const handleMyOrdersClick = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to view your orders.');
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }

    navigate('/my-orders');
  };

  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
      <Link
        to="/"
        className="flex items-center gap-2 text-[#6366F1] font-bold text-2xl"
      >
        <BookOpen size={28} />
        <span className="text-gray-900">PatraPatrika Center</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link to="/" className="hover:text-[#6366F1]">
          Home
        </Link>

        <Link to="/products" className="hover:text-[#6366F1]">
          Products
        </Link>

        <Link to="/location" className="hover:text-[#6366F1]">
          Location
        </Link>

        <Link to="/about" className="hover:text-[#6366F1]">
          About Us
        </Link>

        <Link to="/contact" className="hover:text-[#6366F1]">
          Contact
        </Link>

        {isLoggedIn && (
          <button
            type="button"
            onClick={handleMyOrdersClick}
            className="hover:text-[#6366F1] font-medium"
          >
            My Orders
          </button>
        )}
      </div>

      <div className="flex items-center gap-5">
        {isLoggedIn && (
          <button
            type="button"
            onClick={handleMyOrdersClick}
            className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#6366F1] transition-colors font-semibold text-sm"
            title="My Orders"
          >
            <PackageCheck size={22} />
            <span>My Orders</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCartClick}
          className="relative cursor-pointer"
          title="Cart"
        >
          <ShoppingCart
            className="text-gray-700 hover:text-[#6366F1] transition-colors"
            size={24}
          />
        </button>

        <Menu className="md:hidden text-gray-700" size={24} />
      </div>
    </nav>
  );
};

export default Navbar;