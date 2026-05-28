import React from "react";

function Hero() {
  const handleScrollToFeatured = () => {
    window.scrollTo({
      top: 550,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 py-14 lg:py-20">
        
        {/* MOBILE = image first */}
        {/* DESKTOP = side by side */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* IMAGE SECTION */}
          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200"
                alt="Bookstore"
                className="w-full h-[320px] sm:h-[420px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="absolute bottom-6 left-6 text-left">
                <h2 className="text-white text-3xl font-black">
                  Discover Your Next Book
                </h2>

                <p className="text-white/80 text-sm mt-2 max-w-sm">
                  Explore books, novels, stationery, magazines, and learning essentials.
                </p>
              </div>
            </div>
          </div>

          {/* TEXT SECTION */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-[0.2em] mb-5">
              PatraPatrika Centre
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
              Welcome to Patrapatrika Centre 📚
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl">
              Find your next favorite book and explore our complete bookstore collection with novels, stationery, newspapers, magazines, and educational materials.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                type="button"
                onClick={handleScrollToFeatured}
                className="px-7 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95"
              >
                Explore Books
              </button>

              <button
                type="button"
                className="px-7 py-4 bg-white border border-gray-200 hover:border-orange-300 rounded-2xl text-sm font-black text-gray-800 transition-all"
              >
                View Collections
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;