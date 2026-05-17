import React from 'react';
import { MapPin, Clock, Phone } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";

const Location = () => {
 
  const googleMapUrl = "https://www.google.com/maps/place/Hetauda/@27.4289174,85.0338134,21z/data=!4m6!3m5!1s0x39eb497ced46c917:0xafb8902c7a4532ab!8m2!3d27.4310018!4d85.0319975!16zL20vMGd5Z3Rx?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"; 

  const handleOpenMap = () => {
    window.open(googleMapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-16 px-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Our Location</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Store Info */}
        <div className="space-y-8">
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#6366F1]">BookHaven Main Store</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#6366F1] shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Address</h4>
                  <p className="text-gray-600">Hetauda City, Nepal</p>
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

          {/* Call to Action (Get Directions Button Removed Successfully) */}
          <div className="bg-[#6366F1] text-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Planning a visit?</h3>
            <p className="opacity-90 text-sm mb-0">We offer free parking for customers and a cozy reading nook with fresh coffee.</p>
          </div>
        </div>

        {/* Right Side: Map Trigger Area */}
        <div className="h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-inner border border-gray-200">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-indigo-900/10 flex items-center justify-center">
            {}
            <button 
              onClick={handleOpenMap}
              className="bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <MapPin className="text-red-500" />
              <span className="font-bold text-gray-800">Find us here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;