import React from 'react';
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";

const Contact = () => {
  return (
    <div className="py-20 px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-gray-600">Have a question about a book or an order? We'd love to hear from you.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]"><Mail size={20}/></div>
              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-gray-500 text-sm">support@PatraPatrika Center.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]"><Phone size={20}/></div>
              <div>
                <h4 className="font-bold">Call Us</h4>
                <p className="text-gray-500 text-sm">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]"><MapPin size={20}/></div>
              <div>
                <h4 className="font-bold">Visit Us</h4>
                <p className="text-gray-500 text-sm">123 Book Street, Reading City, RC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea rows="4" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]" placeholder="How can we help?"></textarea>
            </div>
            <button className="w-full bg-[#6366F1] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#4F46E5] transition-colors">
              Send Message <Send size={18}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;