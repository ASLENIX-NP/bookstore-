import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  MessageSquare,
  Send,
  AlertCircle,
  PackageCheck,
  ShieldCheck,
  BookOpen,
  BadgeCheck,
  Sparkles,
  Quote,
  CheckCircle2,
  Zap,
} from 'lucide-react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

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

export default function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [reviewForm, setReviewForm] =
    useState({
      rating: 5,
      comment: '',
    });

  const [loading, setLoading] =
    useState(true);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const getLoggedUser = () => {
    try {
      const storedUser =
        localStorage.getItem('user');

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/products/${id}`
      );

      setProduct(res.data);

      setError(null);
    } catch (err) {
      console.error(
        'Error loading product details:',
        err
      );

      setError(
        'Unable to load product details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const getStatus = () => {
    return (
      product?.stockStatus ||
      product?.statusFlag ||
      'In Stock'
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ADD TO CART
  const addToCart = () => {
    const token =
      localStorage.getItem('token');

    if (!token) {
      toast.error('Please login first to add products to cart.');

      navigate('/login', {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (getStatus() === 'Out of Stock') {
      toast.error(
        'This product is out of stock.'
      );

      return;
    }

    const currentCart = JSON.parse(
      localStorage.getItem('cart') ||
        '[]'
    );

    const existingItem =
      currentCart.find(
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

    localStorage.setItem(
      'cart',
      JSON.stringify(currentCart)
    );

    toast.success(
      `${product.name} added to cart`
    );
  };

  // BUY NOW
  const handleBuyNow = () => {
    const token =
      localStorage.getItem('token');

    if (!token) {
      toast.error('Please login first to buy products.');

      navigate('/login', {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (getStatus() === 'Out of Stock') {
      toast.error(
        'This product is out of stock.'
      );

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

    localStorage.setItem(
      'checkoutType',
      'Buy Now'
    );

    navigate('/checkout/delivery');
  };

  // SUBMIT REVIEW
  const handleReviewSubmit = async (
    e
  ) => {
    e.preventDefault();

    const token =
      localStorage.getItem('token');

    if (!token) {
      toast.error(
        'Please login first to add a review.'
      );

      navigate('/login', {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (
      !reviewForm.comment.trim()
    ) {
      toast.error(
        'Please write your review comment.'
      );

      return;
    }

    const user = getLoggedUser();

    try {
      setReviewLoading(true);

      const res = await axios.post(
        `http://localhost:5000/api/products/${id}/reviews`,
        {
          name:
            user?.name ||
            user?.firstName ||
            user?.email?.split(
              '@'
            )[0] ||
            'Customer',

          email:
            user?.email || '',

          rating: Number(
            reviewForm.rating
          ),

          comment:
            reviewForm.comment.trim(),
        }
      );

      setProduct(res.data);

      setReviewForm({
        rating: 5,
        comment: '',
      });

      toast.success(
        'Review submitted successfully!'
      );
    } catch (err) {
      console.error(
        'Error submitting review:',
        err
      );

      toast.error(
        err.response?.data?.error ||
          'Failed to submit review.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (
    value,
    size = 'w-4 h-4'
  ) => {
    const ratingValue = Math.round(
      Number(value || 0)
    );

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <Star
              key={star}
              className={`${size} ${
                star <= ratingValue
                  ? 'text-amber-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          )
        )}
      </div>
    );
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
        <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 text-center text-white">
          <div className="w-14 h-14 border-4 border-white/20 border-t-orange-400 rounded-full animate-spin mx-auto mb-5" />

          <p className="text-sm font-black tracking-wide">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-8 flex gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0" />

          <div>
            <h3 className="font-black text-lg">
              Product not found
            </h3>

            <p className="text-sm mt-1">
              {error ||
                'Unable to load this product.'}
            </p>

            <Link
              to="/products"
              className="inline-block mt-4 text-sm font-black text-red-600 underline"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatus();

  const isOutOfStock =
    status === 'Out of Stock';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.25),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-black text-slate-200 hover:text-orange-300 cursor-pointer bg-white/10 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20">

        {/* PRODUCT CARD */}
        <section className="relative bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">

          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2" />

          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-70 -translate-x-1/2 translate-y-1/2" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2">

            {/* IMAGE */}
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-4 sm:p-8 lg:p-10">

              <div className="absolute top-7 left-7 z-10 flex flex-wrap gap-2">

                <span className="bg-white/95 backdrop-blur-xl text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {product.category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    isOutOfStock
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {status}
                </span>

              </div>

              <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-white group">

                <img
                  src={
                    product.image ||
                    CART_IMAGE_PLACEHOLDER
                  }
                  alt={product.name}
                  className="w-full h-[430px] sm:h-[580px] lg:h-[680px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">

                  <div className="inline-flex items-center gap-2 text-white text-xs font-black bg-white/15 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full">

                    <Sparkles className="w-4 h-4 text-orange-300" />

                    Store Verified Product

                  </div>

                </div>

              </div>
            </div>

            {/* INFO */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">

              <div className="space-y-7">

                <div>

                  <div className="flex flex-wrap gap-2 mb-5">

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                      {product.subcategory || 'General'}
                    </span>

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
                      Product Details
                    </span>

                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mt-5">

                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full">
                      {renderStars(
                        product.rating,
                        'w-5 h-5'
                      )}

                      <span className="text-sm font-black">
                        {Number(
                          product.rating || 0
                        ).toFixed(1)}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-gray-500">
                      {product.numReviews || 0}{' '}
                      buyer reviews
                    </span>

                  </div>
                </div>

                {/* INFO BOXES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">

                    <PackageCheck className="w-5 h-5 text-emerald-600 mb-2" />

                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Stock
                    </p>

                    <p
                      className={`text-sm font-black ${
                        isOutOfStock
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {status}
                    </p>

                  </div>

                  <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">

                    <BookOpen className="w-5 h-5 text-indigo-600 mb-2" />

                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Category
                    </p>

                    <p className="text-sm font-black text-gray-800 line-clamp-1">
                      {product.category}
                    </p>

                  </div>

                  <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">

                    <ShieldCheck className="w-5 h-5 text-orange-600 mb-2" />

                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Quality
                    </p>

                    <p className="text-sm font-black text-gray-800">
                      Verified
                    </p>

                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-[1.7rem] border border-gray-100 p-6 shadow-sm">

                  <h2 className="font-black text-gray-950 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-indigo-600" />
                    Product Description
                  </h2>

                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">
                    {product.description ||
                      'No description provided.'}
                  </p>

                </div>

              </div>

              {/* PRICE + BUTTONS */}
              <div className="mt-8 bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-[1.7rem] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 shadow-2xl">

                <div>

                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                    Price
                  </p>

                  <p className="text-4xl font-black">
                    NPR{' '}
                    {Number(
                      product.price || 0
                    ).toLocaleString()}
                  </p>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">

                  {/* ADD TO CART */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={addToCart}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-black transition-all ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />

                    {isOutOfStock
                      ? 'Out of Stock'
                      : 'Add to Cart'}
                  </button>

                  {/* BUY NOW */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-black transition-all ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </button>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEW SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* REVIEWS */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">

              <div>

                <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">
                  Customer Feedback
                </p>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
                  <MessageSquare className="w-7 h-7 text-orange-500" />
                  Buyer Reviews
                </h2>

              </div>

              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-black">

                <Star className="w-4 h-4 fill-current" />

                {Number(
                  product.rating || 0
                ).toFixed(1)}{' '}
                Average

              </div>
            </div>

            {!product.reviews ||
            product.reviews.length === 0 ? (

              <div className="text-center bg-slate-50 border border-dashed border-gray-200 rounded-[1.7rem] p-10">

                <Quote className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                <p className="text-sm font-bold text-gray-500">
                  No reviews yet.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {[...product.reviews]
                  .reverse()
                  .map((review) => (

                    <div
                      key={review._id}
                      className="border border-gray-100 rounded-[1.5rem] p-5 bg-gradient-to-br from-slate-50 to-white"
                    >

                      <div className="flex justify-between">

                        <div>

                          <p className="font-black text-gray-950">
                            {review.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {review.createdAt
                              ? new Date(
                                  review.createdAt
                                ).toLocaleString()
                              : ''}
                          </p>

                        </div>

                        {renderStars(
                          review.rating
                        )}

                      </div>

                      <p className="text-sm text-gray-700 mt-4">
                        {review.comment}
                      </p>

                    </div>

                  ))}

              </div>

            )}
          </div>

          {/* REVIEW FORM */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8 h-fit">

            <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-2">
              Share Your Opinion
            </p>

            <h2 className="text-2xl font-black text-gray-950 mb-2">
              Write a Review
            </h2>

            <form
              onSubmit={
                handleReviewSubmit
              }
              className="space-y-5"
            >

              <div>

                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Rating
                </label>

                <select
                  value={
                    reviewForm.rating
                  }
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rating:
                        e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3"
                >

                  <option value="5">
                    5 - Excellent
                  </option>

                  <option value="4">
                    4 - Very Good
                  </option>

                  <option value="3">
                    3 - Good
                  </option>

                  <option value="2">
                    2 - Average
                  </option>

                  <option value="1">
                    1 - Poor
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Review
                </label>

                <textarea
                  value={
                    reviewForm.comment
                  }
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      comment:
                        e.target.value,
                    })
                  }
                  rows="5"
                  placeholder="Write your opinion..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 resize-none"
                />

              </div>

              <button
                type="submit"
                disabled={
                  reviewLoading
                }
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-black text-white ${
                  reviewLoading
                    ? 'bg-gray-400'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >

                <Send className="w-4 h-4" />

                {reviewLoading
                  ? 'Submitting...'
                  : 'Submit Review'}

              </button>

              <div className="flex items-start gap-2 text-xs text-gray-400 bg-slate-50 border border-gray-100 rounded-2xl p-3">

                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />

                <p>
                  You must be logged in
                  to submit a review.
                </p>

              </div>

            </form>
          </div>
        </section>
      </main>
    </div>
  );
}