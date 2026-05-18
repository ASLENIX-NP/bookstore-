import React from 'react';
import { BookOpen, ShoppingCart, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-[#6366F1] font-bold text-2xl">
        <BookOpen size={28} />
        <span className="text-gray-900">Patrapatrika Centre</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link to="/" className="hover:text-[#6366F1]">Home</Link>
        <Link to="/products" className="hover:text-[#6366F1]">Products</Link>
        <Link to="/location" className="hover:text-[#6366F1]">Location</Link>
        <Link to="/about" className="hover:text-[#6366F1]">About Us</Link>
        <Link to="/contact" className="hover:text-[#6366F1]">Contact</Link>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <ShoppingCart className="text-gray-700" size={24} />
         
        </div>
        <Menu className="md:hidden text-gray-700" size={24} />
      </div>
    </nav>
  );
};

export default Navbar;