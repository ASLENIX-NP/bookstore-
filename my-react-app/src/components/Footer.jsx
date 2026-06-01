import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#020617] text-slate-400 px-6 pt-14 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white font-black text-xl">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                <BookOpen className="text-amber-300 w-5 h-5" />
              </div>

              <div>
                <p>PatraPatrika Center</p>
                <p className="text-[11px] text-slate-400 font-black">
                  Books • Stationery • Reading Culture
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-sm">
              A clean and trusted destination for books, stationery, and
              learning essentials.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black mb-4">Quick Links</h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Products
                </Link>
              </li>

              <li>
                <Link to="/location" className="hover:text-white transition">
                  Location
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-4">Policies</h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/policies/terms"
                  className="hover:text-white transition"
                >
                  Terms
                </Link>
              </li>

              <li>
                <Link
                  to="/policies/privacy"
                  className="hover:text-white transition"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-4">Store Promise</h4>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-3 rounded-2xl text-amber-300 text-sm font-black">
              <Sparkles className="w-4 h-4" />
              Quality books. Reliable service.
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 PatraPatrika Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;