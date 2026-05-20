import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  MessageSquare,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLoggedUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
      setError(null);
    } catch (err) {
      console.error('Error loading product details:', err);
      setError('Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const getStatus = () => {
    return product?.stockStatus || product?.statusFlag || 'In Stock';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const addToCart = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to buy products.');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (getStatus() === 'Out of Stock') {
      alert('This product is currently out of stock.');
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find((item) => item._id === product._id);

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
    alert(`"${product.name}" successfully added to your cart!`);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to add a review.');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('Please write your review comment.');
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
            user?.email?.split('@')[0] ||
            'Customer',
          email: user?.email || '',
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        }
      );

      setProduct(res.data);
      setReviewForm({
        rating: 5,
        comment: '',
      });

      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (value) => {
    const ratingValue = Math.round(Number(value || 0));

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= ratingValue
                ? 'text-amber-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <h3 className="font-bold">Product not found</h3>
            <p className="text-sm mt-1">
              {error || 'Unable to load this product.'}
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 text-sm font-bold text-red-600 underline"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatus();
  const isOutOfStock = status === 'Out of Stock';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 min-h-screen">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-orange-600 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <img
            src={
              product.image ||
              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'
            }
            alt={product.name}
            className="w-full max-h-[650px] object-cover bg-slate-50"
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-md">
                {product.category}
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-md">
                {product.subcategory || 'General'}
              </span>

              <span
                className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md ${
                  isOutOfStock
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              {renderStars(product.rating)}
              <span className="text-sm font-bold text-gray-700">
                {Number(product.rating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({product.numReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Product Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                Price
              </p>
              <p className="text-3xl font-black text-gray-900">
                NPR {Number(product.price || 0).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={addToCart}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            Buyer Reviews
          </h2>

          {!product.reviews || product.reviews.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-4">
              {[...product.reviews].reverse().map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-100 rounded-xl p-4 bg-slate-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <p className="text-xs text-gray-400">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleString()
                          : ''}
                      </p>
                    </div>

                    {renderStars(review.rating)}
                  </div>

                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Write a Review
          </h2>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Rating
              </label>

              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    rating: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Average</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Review
              </label>

              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: e.target.value,
                  })
                }
                rows="5"
                placeholder="Write your opinion about this product..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white ${
                reviewLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4" />
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>

            <p className="text-xs text-gray-400">
              You must be logged in to submit a review.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}