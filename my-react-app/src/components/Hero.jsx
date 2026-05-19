import React from 'react';

function Hero() {
  const handleScrollToFeatured = () => {
    // Smoothly scrolls down to your Featured Products section automatically
    window.scrollTo({
      top: 550,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full text-center py-20 bg-gray-50 border-b border-gray-100">
      {/* Big Title matching your branding exactly */}
      <h1 className="text-5xl font-black text-gray-900 tracking-tight">
        Welcome to Patrapatrika Centre 📚
      </h1>

      {/* Catchy Subtitle */}
      <p className="mt-4 text-base text-gray-500 max-w-md mx-auto leading-relaxed">
        Find your next favorite book and explore our full physical library collection.
      </p>

      {/* Interactive Trigger Button */}
      <button 
        type="button"
        onClick={handleScrollToFeatured}
        className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
      >
        Explore Books
      </button>
    </div>
  );
}

export default Hero;