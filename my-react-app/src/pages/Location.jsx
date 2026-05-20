import React from 'react';
import { MapPin, Clock, Phone } from "lucide-react";

const Location = () => {
  return (
    <div className="py-16 px-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Our Location</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Store Info */}
        <div className="space-y-8">
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#6366F1]">Patrapatrika Centre Main Store</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#6366F1] shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Address</h4>
                  <p className="text-gray-600">Parijat Marg, Hetauda City, Nepal</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="text-[#6366F1] shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Store Hours</h4>
                  <p className="text-gray-600 text-sm">Mon - Fri: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-600 text-sm">Sat: 10:00 AM - 6:00 PM</p>
                  <p className="text-gray-600 text-sm">Sun: 11:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[#6366F1] shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Phone</h4>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#6366F1] text-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Planning a visit?</h3>
            <p className="opacity-90 text-sm mb-0">We offer free parking for customers and a cozy reading nook with fresh coffee.</p>
          </div>
        </div>

        {/* Right Side: Embedded Google Map */}
        <div className="h-full min-h-[400px] rounded-2xl overflow-hidden shadow-inner border border-gray-200">
          <iframe 
            /* TO GET THE CORRECT MAP:
               1. Go to Google Maps (maps.google.com)
               2. Search for "Parijat Marg, Hetauda"
               3. Click 'Share' -> 'Embed a map'
               4. Copy the URL inside the src="..." and paste it below
            */
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.157929424843!2d85.03176717546366!3d27.428914638706348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb49e29f8601ad%3A0xb35e3962b322a36d!2sParijat%20Marg%2C%20Hetauda%2044107!5e0!3m2!1sen!2snp!4v1716200000000!5m2!1sen!2snp" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Patrapatrika Centre Location - Parijat Marg"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Location;