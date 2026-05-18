import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-gray-400 py-16 px-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <BookOpen className="text-[#6366F1]" />
            <span>BookHaven</span>
          </div>
          <p className="text-sm">Premium shop for books and stationery.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>Products</li>
            <li>About Us</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <p className="text-sm">Parijat Marg<br/>(555) 123-4567</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Hours</h4>
          <p className="text-sm">Mon-Fri: 9am - 8pm<br/>Sat: 10am - 6pm</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;