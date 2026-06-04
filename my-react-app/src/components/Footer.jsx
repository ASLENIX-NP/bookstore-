import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#020617] text-slate-400 px-12 lg:px-20 pt-24 pb-12">
      <div className="w-full px-24 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_2fr] gap-28">
          <div className="space-y-6">
            <div className="flex items-center gap-5 text-white font-black">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center">
                <BookOpen className="text-amber-300 w-8 h-8" />
              </div>

              <div>
                <p className="text-3xl md:text-4xl leading-tight">
                  PatraPatrika Center
                </p>

                <p className="text-base md:text-lg text-slate-400 font-black mt-2">
                  Books • Stationery • Reading Culture
                </p>
              </div>
            </div>

            <p className="text-2xl leading-relaxed max-w-4xl">
              A clean and trusted destination for books, stationery, and
              learning essentials.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-3xl">
              Quick Links
            </h4>

            <ul className="space-y-4 text-2xl">
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
            <h4 className="text-white font-black mb-6 text-3xl">
              Policies
            </h4>

            <ul className="space-y-4 text-2xl">
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
            <h4 className="text-white font-black mb-6 text-3xl">
              Store Promise
            </h4>

            <div className="inline-flex items-center gap-4 bg-white/10 border border-white/10 px-7 py-5 rounded-3xl text-amber-300 text-2xl font-black">
              <Sparkles className="w-7 h-7" />
              Quality books. Reliable service.
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-20 pt-10 text-center">
          <p className="text-lg text-slate-500">
            © 2026 PatraPatrika Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;