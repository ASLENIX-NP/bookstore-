import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Pen, Notebook, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1566131807516-e3b3cd1a89d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Library interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1623771702313-39dc4f71d275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Book shelves',
  },
  {
    url: 'https://images.unsplash.com/photo-1739133086794-6424277dbfd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Book collection',
  },
  {
    url: 'https://images.unsplash.com/photo-1583526241256-cb18e8635e5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Books on shelf',
  },
  {
    url: 'https://images.unsplash.com/photo-1601469090980-fc95e8d95544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Bookstore interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1620130674275-d709994ed7c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    alt: 'Library books',
  },
];

const LocalImageWithFallback = ({ src, alt, className }) => {
  const fallbackUrl =
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80';

  const handleError = (e) => {
    e.target.src = fallbackUrl;
  };

  return (
    <img
      src={src || fallbackUrl}
      alt={alt || 'BookStore Item'}
      className={className}
      onError={handleError}
    />
  );
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // States for live database synchronization
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manages Slider AND Fetches Live Cloud Data from backend
  useEffect(() => {
    // Slider Timer
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 3500);

    // Fetch up to 4 latest items from your backend database
    const fetchFeaturedData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        // Grab only the first 4 items to keep the homepage layout looking clean
        setFeaturedProducts(response.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("Error connecting to Express server container:", error);
        setLoading(false);
      }
    };

    fetchFeaturedData();

    return () => clearInterval(sliderTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === heroImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden h-[600px] lg:h-[700px] group">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <LocalImageWithFallback
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            </div>
          ))}
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl py-32 lg:py-40">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Welcome to PatraPatrika Center
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-200 drop-shadow-md">
              Premium books, notebooks, and stationery for readers, writers, and
              creative minds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors inline-flex items-center justify-center shadow-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-indigo-600 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-indigo-600 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronRight size={28} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                index === currentSlide
                  ? 'w-8 bg-indigo-600'
                  : 'w-2.5 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose PatraPatrika Center?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Curated Collection
              </h3>
              <p className="text-gray-600">
                Carefully selected books across all genres, from bestsellers to
                hidden gems.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Premium Stationery
              </h3>
              <p className="text-gray-600">
                High-quality pens, pencils, and writing instruments for every
                occasion.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Notebook className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Notebooks & Journals
              </h3>
              <p className="text-gray-600">
                Beautiful notebooks perfect for journaling, planning, and
                creative work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Loaded Dynamically from MongoDB */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>

            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Connecting to cloud warehouse...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-2">No items inside your cloud database collection yet.</p>
              <p className="text-xs text-indigo-600 font-mono">Add products in the admin panel to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <LocalImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mb-3">{product.subcategory || product.category}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex justify-between items-center mt-auto">
                    <span className="text-lg font-bold text-indigo-600">NPR {product.price}</span>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Visit Our Store Today
          </h2>

          <p className="text-xl mb-8 text-indigo-100">
            Experience our full collection in person. We're located in the heart of Kathmandu.
          </p>

          <Link
            to="/location"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors inline-block"
          >
            Find Us
          </Link>
        </div>
      </section>
    </div>
  );
}