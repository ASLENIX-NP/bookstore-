import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Loader2,
  ShoppingCart,
  Eye,
  Star,
  Sparkles,
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
];

const CART_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  // Do not save huge base64 images into localStorage cart/checkout data
  if (String(image).startsWith('data:image')) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
};

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
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    const fetchProducts = async () => {
      try {
        const [
          featuredRes,
          flashSaleRes,
          bestSellerRes,
          newArrivalRes,
        ] = await Promise.all([
          axios.get(
            'http://localhost:5000/api/products?featured=true'
          ),

          axios.get(
            'http://localhost:5000/api/products?flashSale=true'
          ),

          axios.get(
            'http://localhost:5000/api/products?bestSeller=true'
          ),

          axios.get(
            'http://localhost:5000/api/products?newArrival=true'
          ),
        ]);

        setFeaturedProducts(featuredRes.data);
        setFlashSaleProducts(flashSaleRes.data);
        setBestSellerProducts(bestSellerRes.data);
        setNewArrivalProducts(newArrivalRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();

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

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to add products to cart.');
      navigate('/login', { state: { from: '/' } });
      return;
    }

    const isOutOfStock =
      getStatus(product).toLowerCase() === 'out of stock';

    if (isOutOfStock) {
      alert('This product is out of stock.');
      return;
    }

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
        productId: product._id,
        title: product.name,
        name: product.name,
        price: Number(product.price || 0),
        image: getSafeCartImage(product.image),
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));

    alert(`"${product.name}" successfully added to your cart! 🛒`);
  };

  const handleBuyNow = (product) => {
    if (!product) return;

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to buy products.');
      navigate('/login', { state: { from: '/' } });
      return;
    }

    const isOutOfStock =
      getStatus(product).toLowerCase() === 'out of stock';

    if (isOutOfStock) {
      alert('This product is out of stock.');
      return;
    }

    const buyNowItem = [
      {
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: Number(product.price || 0),
        image: getSafeCartImage(product.image),
        quantity: 1,
        subtotal: Number(product.price || 0),
      },
    ];

    localStorage.setItem(
      'checkoutItems',
      JSON.stringify(buyNowItem)
    );

    localStorage.setItem('checkoutType', 'Buy Now');

    navigate('/checkout/delivery');
  };

  const ProductCard = ({ product, type }) => {
    const isOutOfStock =
      getStatus(product).toLowerCase() === 'out of stock';

    return (
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border">
        <div className="relative">
          <LocalImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
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
          {type === 'featured' && (
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

              <span className="text-sm font-bold text-gray-500">
                Featured Product
              </span>
            </div>
          )}

          <h3 className="text-xl font-black mb-2">
            {product.name}
          </h3>

          <p
            className="text-gray-500 text-sm mb-4 leading-relaxed min-h-[40px]"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description || 'Premium quality product'}
          </p>

          <div className="mb-4">
            {type === 'flash' ? (
              <>
                <span className="text-red-600 font-black text-2xl">
                  NPR {product.salePrice || product.price}
                </span>

                {product.salePrice && (
                  <span className="line-through text-gray-400 ml-2">
                    NPR {product.price}
                  </span>
                )}
              </>
            ) : (
              <div className="text-2xl font-black">
                NPR {product.price}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                openProductDetails(product._id)
              }
              className="bg-slate-100 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors"
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
              className={`py-2 rounded-xl font-bold transition-colors ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
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
              onClick={() => handleBuyNow(product)}
              className={`py-2 rounded-xl font-bold transition-colors ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[680px]">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide
                  ? 'opacity-100'
                  : 'opacity-0'
              }`}
            >
              <LocalImageWithFallback
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 min-h-[680px] flex items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Books, Stationery, Magazines & More
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              Welcome to
              <span className="block text-indigo-300">
                PatraPatrika Center
              </span>
            </h1>

            <p className="text-xl text-slate-200 max-w-2xl mb-8">
              Premium books, notebooks, and stationery for
              readers, writers, and creative minds.
            </p>

            <div className="flex gap-4">
              <Link
                to="/products"
                className="bg-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/about"
                className="border border-white/30 bg-white/10 px-8 py-4 rounded-2xl font-black"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Layers className="w-4 h-4" />
              Latest Picks
            </div>

            <h2 className="text-5xl font-black text-gray-900">
              Featured Products
            </h2>

            <p className="text-gray-500 mt-3">
              Explore products recently added to the store.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  type="featured"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              🔥 Flash Sale
            </div>

            <h2 className="text-5xl font-black text-gray-900">
              Flash Sale Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                type="flash"
              />
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              ⭐ Best Seller
            </div>

            <h2 className="text-5xl font-black text-gray-900">
              Best Seller Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellerProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                type="best"
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              🆕 New Arrival
            </div>

            <h2 className="text-5xl font-black text-gray-900">
              New Arrival Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivalProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                type="new"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-700 text-white overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md mb-6">
            <MapPin className="w-8 h-8" />
          </div>

          <h2 className="text-5xl font-black mb-4">
            Visit Our Store Today
          </h2>

          <p className="text-xl mb-8 text-indigo-100">
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