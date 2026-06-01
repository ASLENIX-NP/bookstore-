import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Loader2,
  ShoppingCart,
  Heart,
  Star,
  Sparkles,
  Layers,
  MapPin,
  ShieldCheck,
  Flame,
  BadgePercent,
} from "lucide-react";
import axios from "axios";

const CART_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  if (String(image).startsWith("data:image")) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
};

const LocalImageWithFallback = ({ src, alt, className }) => {
  const fallbackUrl =
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80";

  const handleError = (e) => {
    e.target.src = fallbackUrl;
  };

  return (
    <img
      src={src || fallbackUrl}
      alt={alt || "BookStore Item"}
      className={className}
      onError={handleError}
    />
  );
};

export default function Home() {
  const navigate = useNavigate();

  const [heroData, setHeroData] = useState({
    backgroundImage: "",
    sliderImages: [],
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/hero"
        );

        setHeroData(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchProducts = async () => {
      try {
        const [featuredRes, flashSaleRes, bestSellerRes, newArrivalRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/products?featured=true"),
            axios.get("http://localhost:5000/api/products?flashSale=true"),
            axios.get("http://localhost:5000/api/products?bestSeller=true"),
            axios.get("http://localhost:5000/api/products?newArrival=true"),
          ]);

        setFeaturedProducts(featuredRes.data);
        setFlashSaleProducts(flashSaleRes.data);
        setBestSellerProducts(bestSellerRes.data);
        setNewArrivalProducts(newArrivalRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchHero();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!heroData.sliderImages?.length) return;

    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev >= heroData.sliderImages.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(sliderTimer);
  }, [heroData.sliderImages]);

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getStatus = (product) => {
    return product.stockStatus || product.statusFlag || "In Stock";
  };

  const addToCart = (product) => {
    if (!product) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to add products to cart.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    const isOutOfStock = getStatus(product).toLowerCase() === "out of stock";

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const finalPrice =
        Number(product.salePrice) > 0
          ? Number(product.salePrice)
          : Number(product.price || 0);
    
      currentCart.push({
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: finalPrice,
        image: getSafeCartImage(product.image),
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));

    toast.success(`"${product.name}" successfully added to your cart! 🛒`);
  };

  const handleBuyNow = (product) => {
    if (!product) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to buy products.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    const isOutOfStock = getStatus(product).toLowerCase() === "out of stock";

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    const finalPrice =
    Number(product.salePrice) > 0
      ? Number(product.salePrice)
      : Number(product.price || 0);
  
  const buyNowItem = [
    {
      _id: product._id,
      productId: product._id,
      title: product.name,
      name: product.name,
      price: finalPrice,
      image: getSafeCartImage(product.image),
      quantity: 1,
      subtotal: finalPrice,
    },
  ];

    localStorage.setItem("checkoutItems", JSON.stringify(buyNowItem));
    localStorage.setItem("checkoutType", "Buy Now");

    navigate("/checkout/delivery");
  };

  const ProductCard = ({ product, type }) => {
    const isOutOfStock = getStatus(product).toLowerCase() === "out of stock";
    const isFlashSale = type === "Flash Sale";

    return (
      <div
        className={`group relative bg-white rounded-[2rem] overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-2 ${
          isFlashSale
            ? "border-orange-200 hover:shadow-2xl hover:shadow-orange-200/70"
            : "border-slate-100 hover:shadow-2xl hover:shadow-slate-200/80"
        }`}
      >
        {isFlashSale && (
          <div className="absolute -top-14 -right-14 w-36 h-36 bg-orange-400/20 blur-3xl rounded-full pointer-events-none group-hover:bg-orange-400/35 transition-all duration-500" />
        )}

        <div
          className="relative cursor-pointer bg-slate-100 overflow-hidden"
          onClick={() => openProductDetails(product._id)}
        >
          <LocalImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          <div
            className={`absolute inset-0 ${
              isFlashSale
                ? "bg-gradient-to-t from-orange-950/65 via-slate-950/15 to-transparent"
                : "bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-70"
            }`}
          />

          {isFlashSale && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-all">
              <Flame className="w-3.5 h-3.5 fill-white" />
              HOT DEAL
            </div>
          )}

          {type && (
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black border backdrop-blur transition-all group-hover:scale-105 ${
                  isFlashSale
                    ? "bg-white/95 text-orange-600 border-orange-100"
                    : "bg-white/90 text-slate-800 border-white/70"
                }`}
              >
                {type}
              </span>
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                const token = localStorage.getItem("token");

                if (!token) {
                  toast.error("Please login first!");
                  navigate("/login");
                  return;
                }

                const currentWishlist = JSON.parse(
                  localStorage.getItem("wishlist") || "[]"
                );

                const exists = currentWishlist.find(
                  (item) => item._id === product._id
                );

                let updatedWishlist = [];

                if (exists) {
                  updatedWishlist = currentWishlist.filter(
                    (item) => item._id !== product._id
                  );

                  toast.success("Removed from wishlist");
                } else {
                  updatedWishlist = [...currentWishlist, product];

                  toast.success("Added to wishlist");
                }

                setWishlist(updatedWishlist);

                localStorage.setItem(
                  "wishlist",
                  JSON.stringify(updatedWishlist)
                );

                window.dispatchEvent(new Event("storage"));
              }}
              className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-white hover:scale-110 flex items-center justify-center shadow-lg backdrop-blur transition-all"
              title="Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  wishlist.find((item) => item._id === product._id)
                    ? "fill-red-500 text-red-500"
                    : "text-slate-700"
                }`}
              />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all group-hover:scale-105">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              {Number(product.rating || 0).toFixed(1)}
            </div>

            {isFlashSale && (
              <div className="inline-flex items-center gap-1.5 bg-white/95 text-orange-600 px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all group-hover:scale-105">
                <BadgePercent className="w-3.5 h-3.5" />
                Deal
              </div>
            )}
          </div>
        </div>

        <div className="p-5 relative">
          <button
            type="button"
            onClick={() => openProductDetails(product._id)}
            className="text-left w-full"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                className={`font-black text-lg leading-snug transition-colors ${
                  isFlashSale
                    ? "text-slate-950 group-hover:text-orange-600"
                    : "text-slate-950 group-hover:text-indigo-700"
                }`}
              >
                {product.name || "Untitled Product"}
              </h3>

              <span
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-black ${
                  isOutOfStock
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>
          </button>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] min-h-[44px]">
            {product.description ||
              product.details ||
              "Explore this product and view complete information before ordering."}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                {isFlashSale ? "Flash Sale Price" : "Price"}
              </p>

              <p
                className={`text-2xl font-black transition-all group-hover:scale-[1.03] origin-left ${
                  isFlashSale ? "text-[#f57224]" : "text-slate-950"
                }`}
              >
                NPR{" "}
                {Number(
                  isFlashSale
                    ? product.salePrice || product.price || 0
                    : product.price || 0
                ).toLocaleString()}
              </p>

              {isFlashSale && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-400 line-through font-bold">
                    NPR {Number(product.price || 0).toLocaleString()}
                  </p>

                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                    -
                    {Math.round(
                      (((product.price || 0) - (product.salePrice || 0)) /
                        (product.price || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Reviews
              </p>

              <p className="text-sm font-black text-slate-700">
                {product.numReviews || product.reviews?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all hover:-translate-y-1 hover:scale-[1.02] ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isFlashSale
                  ? "bg-orange-50 hover:bg-orange-100 text-orange-700"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
            </button>

            <button
              type="button"
              onClick={() => handleBuyNow(product)}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all hover:-translate-y-1 hover:scale-[1.02] ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isFlashSale
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-950 hover:bg-indigo-700 text-white shadow-md"
              }`}
            >
              {isFlashSale && <Flame className="w-4 h-4 fill-white" />}
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProductSection = ({
    title,
    subtitle,
    badge,
    products,
    icon,
    type,
    viewAllLink = "/products",
  }) => {
    const visibleProducts = Array.isArray(products) ? products.slice(0, 4) : [];
    const isFlashSale = type === "Flash Sale";

    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className={`transition-all duration-300 ${
            isFlashSale
              ? "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-50 via-white to-red-50 border border-orange-100 p-5 sm:p-7 shadow-lg shadow-orange-100/70 hover:shadow-2xl hover:shadow-orange-200/70"
              : ""
          }`}
        >
          {isFlashSale && (
            <>
              <div className="absolute -top-20 -right-16 w-64 h-64 bg-orange-300/25 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-red-300/20 blur-3xl rounded-full" />
            </>
          )}

          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-7">
            <div>
              <div
                className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-4 transition-all hover:-translate-y-1 hover:scale-105 ${
                  isFlashSale
                    ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                }`}
              >
                {isFlashSale ? <Flame className="w-4 h-4 fill-white" /> : icon}
                {badge}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                {title}
              </h2>

              <p
                className={`mt-2 max-w-2xl ${
                  isFlashSale ? "text-slate-600" : "text-slate-500"
                }`}
              >
                {subtitle}
              </p>
            </div>

            <Link
              to={viewAllLink}
              className={`inline-flex items-center justify-center gap-2 border px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-sm hover:-translate-y-1 hover:scale-[1.02] ${
                isFlashSale
                  ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-orange-500/20"
                  : "bg-white hover:bg-slate-950 text-slate-800 hover:text-white border-slate-200"
              }`}
            >
              {isFlashSale ? "View All Deals" : "View All"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {visibleProducts.length === 0 ? (
            <div
              className={`relative border border-dashed rounded-[2rem] p-10 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${
                isFlashSale
                  ? "bg-white/70 border-orange-200"
                  : "bg-white border-slate-200"
              }`}
            >
              {isFlashSale ? (
                <Flame className="w-10 h-10 text-orange-400 fill-orange-400 mx-auto mb-3" />
              ) : (
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              )}

              <p className="font-black text-slate-800">
                {isFlashSale
                  ? "No flash sale products found"
                  : "No products found"}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Products will appear here after they are added from admin.
              </p>
            </div>
          ) : (
            <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product._id} product={product} type={type} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          {heroData.sliderImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hero ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-45" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-indigo-950/80" />
          <div className="absolute -top-32 -right-20 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-amber-400/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-center">
<div className="order-1 lg:order-1 lg:col-span-6 lg:-translate-y-8 xl:-translate-y-25 transition-transform">              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 backdrop-blur transition-all hover:bg-white/15 hover:-translate-y-1">
                <Sparkles className="w-4 h-4" />
                Premium Bookstore Experience
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.03]">
                Discover books that shape your thinking.
              </h1>

              <p className="text-slate-300 text-base sm:text-lg mt-6 max-w-2xl leading-relaxed">
                Browse selected books, learning materials, and stationery from
                PatraPatrika Center with secure checkout and reliable service.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-4 rounded-2xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-1 hover:scale-[1.02] hover:shadow-amber-500/40"
                >
                  Shop Products
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/location"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-7 py-4 rounded-2xl text-sm font-black backdrop-blur transition-all hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <MapPin className="w-5 h-5" />
                  Visit Store
                </Link>
              </div>
            </div>

            <div className="order-2 lg:order-2 lg:col-span-6 xl:-mr-16">
              <div className="relative group">
                <div className="absolute -inset-5 bg-gradient-to-br from-amber-400/30 to-indigo-500/30 blur-2xl rounded-[3.4rem] transition-all duration-500 group-hover:from-amber-400/45 group-hover:to-indigo-500/45" />

                <div className="relative bg-white/10 border border-white/10 rounded-[3.4rem] p-4 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                <img
  src={
    heroData?.sliderImages?.length > 0
      ? heroData.sliderImages[
          currentSlide % heroData.sliderImages.length
        ]
      : ""
  }
  alt="Hero Image"
  className="w-full h-[500px] lg:h-[540px] xl:h-[570px] object-cover rounded-[2.6rem] transition-transform duration-700 group-hover:scale-[1.03]"
/>

                  <div className="absolute left-8 right-8 bottom-8 bg-white/95 border border-white rounded-3xl p-5 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center transition-all hover:scale-110">
                        <ShieldCheck className="w-6 h-6" />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          Secure bookstore checkout
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Cart, delivery, payment, tracking, and invoice flow
                          ready.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-5">
                  {heroData.sliderImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition-all hover:bg-amber-300 hover:scale-125 ${
                        index === currentSlide
                          ? "w-10 bg-amber-400"
                          : "w-2.5 bg-white/30"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/15 hover:border-white/20">
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Trusted checkout flow
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/15 hover:border-white/20">
                  <p className="text-3xl font-black text-white">VAT</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Invoice-ready orders
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/15 hover:border-white/20">
                  <p className="text-3xl font-black text-white">Fast</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Delivery processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/70 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-indigo-100">
              <Layers className="w-6 h-6" />
            </div>

            <h3 className="font-black text-slate-950 text-lg">
              Curated Selection
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Explore featured books, new arrivals, best sellers, and special
              offers.
            </p>
          </div>

          <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/70 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-amber-100">
              <ShoppingCart className="w-6 h-6" />
            </div>

            <h3 className="font-black text-slate-950 text-lg">
              Easy Purchase Flow
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Add to cart, buy instantly, select delivery information, and place
              your order.
            </p>
          </div>

          <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/70 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-black text-slate-950 text-lg">
              Order Tracking
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Track your order status, payment status, and invoice from your
              account.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="min-h-[420px] flex items-center justify-center">
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 flex items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <p className="font-black text-slate-600">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          <ProductSection
            title="Flash Sale"
            subtitle="Special products and limited-time selections for quick buyers."
            badge="Limited Deals"
            icon={<Flame className="w-4 h-4 fill-white" />}
            products={flashSaleProducts}
            type="Flash Sale"
            viewAllLink="/products?collection=flashSale"
          />

          <ProductSection
            title="Best Sellers"
            subtitle="Popular choices customers are buying and reviewing."
            badge="Popular"
            icon={<ShoppingCart className="w-4 h-4" />}
            products={bestSellerProducts}
            type="Best Seller"
            viewAllLink="/products?collection=bestSeller"
          />

          <ProductSection
            title="Featured Collection"
            subtitle="Handpicked products selected for readers and learners."
            badge="Featured"
            icon={<Sparkles className="w-4 h-4" />}
            products={featuredProducts}
            type="Featured"
            viewAllLink="/products?collection=featured"
          />

          <ProductSection
            title="New Arrivals"
            subtitle="Freshly added products from the latest collection."
            badge="New"
            icon={<Layers className="w-4 h-4" />}
            products={newArrivalProducts}
            type="New Arrival"
            viewAllLink="/products?collection=newArrival"
          />
        </>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 sm:p-12 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/25 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-400/20 blur-3xl rounded-full" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-5 transition-all hover:bg-white/15 hover:-translate-y-1">
                <ShieldCheck className="w-4 h-4" />
                Ready to Order
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white">
                Find your next book today.
              </h2>

              <p className="text-slate-300 mt-3 max-w-2xl">
                Browse all products, view details, add to cart, or buy instantly
                with delivery information and order tracking.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-4 rounded-2xl text-sm font-black shadow-lg transition-all hover:-translate-y-1 hover:scale-[1.02] hover:shadow-amber-500/30"
            >
              Explore All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}