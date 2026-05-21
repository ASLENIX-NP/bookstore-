import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Pen,
  Notebook,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart,
  Eye,
  Star,
  Sparkles,
  BadgeCheck,
  Layers,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
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
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    const fetchFeaturedData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/products?featured=true'
        );

        setFeaturedProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error(
          'Error connecting to Express server container:',
          error
        );
        setLoading(false);
      }
    };

    fetchFeaturedData();

    return () => clearInterval(sliderTimer);
  }, []);

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getStatus = (product) => {
    return product.stockStatus || product.statusFlag || 'In Stock';
  };

  const addToCart = (product) => {
    if (!product) return;

    const currentCart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const existingItem = currentCart.find(
      (item) => item._id === product._id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        _id: product._id,
        title: product.name,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));

    alert(`"${product.name}" successfully added to your cart! 🛒`);
  };

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
    <div className="bg-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[680px] lg:min-h-[760px] group">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0'
              }`}
            >
              <LocalImageWithFallback
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <div className="absolute top-24 right-10 w-72 h-72 bg-indigo-600/30 rounded-full blur-[100px] z-10" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[680px] lg:min-h-[760px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div className="max-w-3xl py-28">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Books, Stationery, Magazines & More
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 drop-shadow-lg leading-[1.05]">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-orange-200">
                  PatraPatrika Center
                </span>
              </h1>

              <p className="text-lg md:text-2xl mb-8 text-slate-200 drop-shadow-md leading-relaxed max-w-2xl">
                Premium books, notebooks, and stationery for readers,
                writers, and creative minds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-black hover:from-indigo-700 hover:to-violet-700 transition-all inline-flex items-center justify-center gap-2 shadow-2xl shadow-indigo-900/40 hover:-translate-y-1"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/about"
                  className="border border-white/30 bg-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-black hover:bg-white hover:text-gray-900 transition-all inline-flex items-center justify-center shadow-xl"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/30 to-orange-500/20 rounded-[3rem] blur-2xl" />

              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/15 rounded-[2rem] p-5 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-[1.5rem] p-4 shadow-xl">
                  <LocalImageWithFallback
                    src={heroImages[currentSlide].url}
                    alt={heroImages[currentSlide].alt}
                    className="w-full h-[430px] object-cover rounded-[1.2rem]"
                  />

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck className="w-5 h-5 text-indigo-600" />
                      <p className="text-sm font-black text-indigo-600 uppercase tracking-wider">
                        Featured Store
                      </p>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900">
                      Books & Stationery Hub
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Explore academic books, novels, notebooks,
                      magazines, and everyday stationery items.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Layers className="w-4 h-4" />
                Latest Picks
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-gray-900">
                Featured Products
              </h2>

              <p className="text-gray-500 mt-3 text-base">
                Explore products recently added to the store.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] shadow-sm border border-gray-100">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />

              <p className="text-sm text-gray-500 font-semibold">
                Loading Products...
              </p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-gray-500">
                No featured products found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => {
                const isOutOfStock =
                  getStatus(product).toLowerCase() ===
                  'out of stock';

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative overflow-hidden">
                      <LocalImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {getStatus(product)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

                        <span className="text-sm text-gray-500 font-semibold">
                          Featured Product
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 mb-2">
                        {product.name}
                      </h3>

                     <p
  className="text-sm text-gray-500 mb-4 leading-relaxed min-h-[40px]"
  style={{
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }}
>
  {product.description || 'Premium quality product'}
</p>

                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                        <span className="text-lg font-black text-slate-900 tracking-tight mb-2">
                          NPR{' '}
                          {Number(
                            product.price || 0
                          ).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            openProductDetails(product._id)
                          }
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl text-xs font-black transition-colors"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            Details
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product)}
                          className={`w-full py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => navigate('/checkout')}
                          className={`w-full py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                          }`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-700 text-white overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md mb-6">
            <MapPin className="w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Visit Our Store Today
          </h2>

          <p className="text-lg md:text-xl mb-8 text-indigo-100 leading-relaxed">
            Experience our full collection in person.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/location"
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 shadow-xl"
            >
              Find Us
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="inline-flex items-center gap-2 text-indigo-100 font-semibold">
              <ShieldCheck className="w-5 h-5" />
              Trusted local bookstore experience
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}