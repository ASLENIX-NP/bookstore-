import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Lock,
} from "lucide-react";

import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

const CART_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const ratingLabels = {
  1: "Poor",
  2: "Average",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  if (String(image).startsWith("data:image")) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
};

const getProductImages = (product) => {
  const images = [];

  if (Array.isArray(product?.images)) {
    images.push(...product.images.filter(Boolean));
  }

  if (product?.image) {
    images.unshift(product.image);
  }

  const uniqueImages = [...new Set(images)]
    .map((image) => getSafeCartImage(image))
    .filter(Boolean);

  return uniqueImages.length > 0 ? uniqueImages : [CART_IMAGE_PLACEHOLDER];
};

const getPrimaryProductImage = (product) => {
  return getProductImages(product)[0] || CART_IMAGE_PLACEHOLDER;
};

const getNumberValue = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getOriginalPrice = (product) => {
  return Math.max(0, getNumberValue(product?.price));
};

const getRawSalePriceValue = (product) => {
  const possibleFields = [
    product?.salePrice,
    product?.discountPrice,
    product?.discountedPrice,
    product?.offerPrice,
    product?.specialPrice,
    product?.flashSalePrice,
  ];

  return possibleFields.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== ""
  );
};

const hasSalePriceInput = (product) => {
  return getRawSalePriceValue(product) !== undefined;
};

const getSalePriceNumber = (product) => {
  const rawSalePrice = getRawSalePriceValue(product);

  if (rawSalePrice === undefined) {
    return null;
  }

  const salePrice = Number(rawSalePrice);

  return Number.isFinite(salePrice) ? salePrice : null;
};

const getSalePrice = (product) => {
  const salePrice = getSalePriceNumber(product);

  if (salePrice === null) {
    return 0;
  }

  return Math.max(0, salePrice);
};

const hasValidSalePrice = (product) => {
  const originalPrice = getOriginalPrice(product);
  const salePrice = getSalePriceNumber(product);

  return (
    hasSalePriceInput(product) &&
    originalPrice > 0 &&
    salePrice !== null &&
    salePrice >= 0 &&
    salePrice < originalPrice
  );
};

const getFinalPrice = (product) => {
  return hasValidSalePrice(product)
    ? getSalePrice(product)
    : getOriginalPrice(product);
};

const getDiscountPercent = (product) => {
  if (!hasValidSalePrice(product)) return "0";

  const originalPrice = getOriginalPrice(product);
  const salePrice = getSalePrice(product);

  const discount = ((originalPrice - salePrice) / originalPrice) * 100;

  if (salePrice === 0) {
    return "100";
  }

  return discount.toFixed(2).replace(/\.00$/, "");
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reviewOrderFromUrl = searchParams.get("reviewOrder") || "";

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [error, setError] = useState(null);

  const getLoggedUser = () => {
    const directEmail =
      localStorage.getItem("email") || localStorage.getItem("userEmail");

    const possibleUserKeys = ["user", "currentUser", "authUser"];

    for (const key of possibleUserKeys) {
      try {
        const value = localStorage.getItem(key);

        if (!value) continue;

        const parsed = JSON.parse(value);

        if (parsed?.email) {
          return parsed;
        }
      } catch {
        // ignore invalid localStorage value
      }
    }

    if (directEmail) {
      return {
        email: directEmail,
      };
    }

    return null;
  };

  const getLoggedUserEmail = () => {
    const user = getLoggedUser();

    return String(user?.email || "").toLowerCase().trim();
  };

  const hasUserReviewedOrder = (productData, orderId) => {
    const userEmail = getLoggedUserEmail();

    const reviews = Array.isArray(productData?.reviews)
      ? productData.reviews
      : [];

    return reviews.some((review) => {
      const reviewEmail = String(review?.email || "").toLowerCase().trim();
      const reviewOrderId = review?.orderId || "";

      return (
        userEmail &&
        reviewEmail === userEmail &&
        String(reviewOrderId) === String(orderId)
      );
    });
  };

  const isDeliveredOrCompleted = (order) => {
    const possibleStatuses = [
      order?.orderStatus,
      order?.status,
      order?.deliveryStatus,
    ];

    return possibleStatuses.some((status) =>
      ["delivered", "completed"].includes(
        String(status || "").toLowerCase().trim()
      )
    );
  };

  const getOrderItemProductId = (item) => {
    return (
      item?.productId?._id ||
      item?.productId ||
      item?.product?._id ||
      item?.product ||
      item?._id ||
      ""
    );
  };

  const fetchProduct = async () => {
    const res = await axios.get(`https://bookstore-f3if.onrender.com/api/products/${id}`);

    const productData = res.data?.product || res.data?.data || res.data;

    setProduct(productData);
    setSelectedImage(getPrimaryProductImage(productData));
    setError(null);

    return productData;
  };

  const checkReviewEligibility = async (productData) => {
    try {
      const userEmail = getLoggedUserEmail();

      if (!userEmail) {
        setCanReview(false);
        setHasReviewed(false);
        setReviewOrderId("");
        return;
      }

      const ordersRes = await axios.get(
        `https://bookstore-f3if.onrender.com/api/orders/user/${encodeURIComponent(userEmail)}`
      );

      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      const deliveredOrdersForProduct = orders.filter((order) => {
        if (!isDeliveredOrCompleted(order)) {
          return false;
        }

        const orderItems =
          order.orderItems || order.items || order.cartItems || [];

        return orderItems.some((item) => {
          const itemProductId = getOrderItemProductId(item);

          return String(itemProductId) === String(id);
        });
      });

      if (deliveredOrdersForProduct.length === 0) {
        setCanReview(false);
        setHasReviewed(false);
        setReviewOrderId("");
        return;
      }

      const requestedOrder = reviewOrderFromUrl
        ? deliveredOrdersForProduct.find(
            (order) => String(order._id) === String(reviewOrderFromUrl)
          )
        : null;

      const orderToReview =
        requestedOrder ||
        deliveredOrdersForProduct.find(
          (order) => !hasUserReviewedOrder(productData, order._id)
        );

      if (!orderToReview) {
        setCanReview(false);
        setHasReviewed(true);
        setReviewOrderId("");
        return;
      }

      const alreadyReviewedThisOrder = hasUserReviewedOrder(
        productData,
        orderToReview._id
      );

      setHasReviewed(alreadyReviewedThisOrder);
      setCanReview(!alreadyReviewedThisOrder);
      setReviewOrderId(
        alreadyReviewedThisOrder ? "" : String(orderToReview._id)
      );
    } catch (error) {
      console.error("Review eligibility error:", error);
      setCanReview(false);
      setHasReviewed(false);
      setReviewOrderId("");
    }
  };

  useEffect(() => {
    const loadProductAndReviewStatus = async () => {
      try {
        setLoading(true);

        const productData = await fetchProduct();

        await checkReviewEligibility(productData);
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProductAndReviewStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatus = () => {
    return product?.stockStatus || product?.statusFlag || "In Stock";
  };

  const isProductOutOfStock = () => {
    return String(getStatus()).toLowerCase() === "out of stock";
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleImageZoomMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setZoomPosition({
      x: 50,
      y: 50,
    });
  };

  const addToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to add products to cart.");

      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (isProductOutOfStock()) {
      toast.error("This product is out of stock.");
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const finalPrice = getFinalPrice(product);
      const cartImage = getSafeCartImage(
        selectedImage || getPrimaryProductImage(product)
      );

      currentCart.push({
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: finalPrice,
        image: cartImage,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));

    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to buy products.");

      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (isProductOutOfStock()) {
      toast.error("This product is out of stock.");
      return;
    }

    const finalPrice = getFinalPrice(product);
    const checkoutImage = getSafeCartImage(
      selectedImage || getPrimaryProductImage(product)
    );

    const buyNowItem = [
      {
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: finalPrice,
        image: checkoutImage,
        quantity: 1,
        subtotal: finalPrice,
      },
    ];

    localStorage.setItem("checkoutItems", JSON.stringify(buyNowItem));
    localStorage.setItem("checkoutType", "Buy Now");

    navigate("/checkout/delivery");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to add a review.");

      navigate("/login", {
        state: {
          from: `/products/${id}`,
        },
      });

      return;
    }

    if (!canReview) {
      toast.error(
        hasReviewed
          ? "You have already reviewed this product."
          : "You can review this product only after purchase and delivery."
      );
      return;
    }

    if (!reviewOrderId) {
      toast.error("Review order not found. Please open review from My Orders.");
      return;
    }

    const user = getLoggedUser();
    const userEmail = getLoggedUserEmail();

    try {
      setReviewLoading(true);

      const res = await axios.post(
        `https://bookstore-f3if.onrender.com/api/products/${id}/reviews`,
        {
          name:
            user?.name ||
            user?.firstName ||
            user?.fullName ||
            user?.email?.split("@")[0] ||
            "Customer",

          email: userEmail,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
          orderId: reviewOrderId,
        }
      );

      const updatedProduct = res.data?.product || res.data?.data || res.data;

      setProduct(updatedProduct);

      setReviewForm({
        rating: 5,
        comment: "",
      });

      setHoverRating(0);
      setHasReviewed(true);
      setCanReview(false);

      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);

      if (err.response?.status === 409) {
        setHasReviewed(true);
        setCanReview(false);
      }

      toast.error(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (value, size = "w-4 h-4") => {
    const ratingValue = Math.round(Number(value || 0));

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= ratingValue
                ? "text-amber-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    const activeRating = hoverRating || Number(reviewForm.rating || 0);

    return (
      <div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setReviewForm({
                  ...reviewForm,
                  rating: star,
                })
              }
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              className="rounded-xl p-1.5 transition-all hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100"
              aria-label={`${ratingLabels[star]} rating`}
            >
              <Star
                className={`w-9 h-9 transition-all hover:scale-110 ${
                  star <= activeRating
                    ? "text-amber-400 fill-current drop-shadow-sm"
                    : "text-gray-300 hover:text-amber-300"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-2 rounded-full text-sm font-black">
          {renderStars(reviewForm.rating, "w-4 h-4")}

          <span>
            {reviewForm.rating} - {ratingLabels[reviewForm.rating]}
          </span>
        </div>
      </div>
    );
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-8 flex gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0" />

          <div>
            <h3 className="font-black text-lg">Product not found</h3>

            <p className="text-sm mt-1">
              {error || "Unable to load this product."}
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
  const isOutOfStock = isProductOutOfStock();

  const originalPrice = getOriginalPrice(product);
  const finalPrice = getFinalPrice(product);
  const hasDiscount = hasValidSalePrice(product);
  const discountPercent = getDiscountPercent(product);

  const stockText = isOutOfStock
    ? "Out of Stock"
    : Number(product.stock) > 0
    ? `${product.stock} left`
    : status;

  const productImages = getProductImages(product);
  const productDisplayImage = getSafeCartImage(
    selectedImage || getPrimaryProductImage(product)
  );

  return (
    <div className="min-h-screen bg-slate-50">
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
        <section className="relative bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-visible">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-70 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2">
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-4 sm:p-8 lg:p-10 rounded-l-[2rem]">
              <div className="absolute top-7 left-7 z-10 flex flex-wrap gap-2">
                <span className="bg-white/95 backdrop-blur-xl text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {product.category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    isOutOfStock
                      ? "bg-red-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {stockText}
                </span>
              </div>

              <div
                className="relative rounded-[2rem] bg-white shadow-2xl border border-white"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => setZoomActive(false)}
                onMouseMove={handleImageZoomMove}
              >
                <div className="relative overflow-hidden rounded-[2rem] cursor-zoom-in">
                  <img
                    src={productDisplayImage}
                    alt={product.name}
                    className="w-full h-[430px] sm:h-[580px] lg:h-[680px] object-cover select-none"
                    draggable="false"
                  />

                  {zoomActive && (
                    <div
                      className="hidden lg:block absolute w-36 h-36 border-2 border-orange-500 bg-orange-100/20 pointer-events-none rounded-xl"
                      style={{
                        left: `calc(${zoomPosition.x}% - 72px)`,
                        top: `calc(${zoomPosition.y}% - 72px)`,
                      }}
                    />
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="inline-flex items-center gap-2 text-white text-xs font-black bg-white/15 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full">
                      <Sparkles className="w-4 h-4 text-orange-300" />
                      Hover image to zoom
                    </div>
                  </div>
                </div>

                {zoomActive && (
                  <div className="hidden xl:block absolute left-[calc(100%+1rem)] top-0 w-[520px] h-[520px] bg-white border border-gray-200 rounded-[1.5rem] shadow-2xl overflow-hidden z-50">
                    <div
                      className="w-full h-full bg-no-repeat"
                      style={{
                        backgroundImage: `url(${productDisplayImage})`,
                        backgroundSize: "240%",
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="mt-5 bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Product Gallery
                    </p>

                    <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-1 rounded-full font-black">
                      {productImages.length} images
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {productImages.map((image, index) => {
                      const isActive = productDisplayImage === image;

                      return (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => handleSelectImage(image)}
                          className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                            isActive
                              ? "border-orange-500 ring-4 ring-orange-100"
                              : "border-white hover:border-orange-300"
                          }`}
                          title={`View image ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {isActive && (
                            <span className="absolute inset-x-1 bottom-1 bg-orange-500 text-white text-[9px] font-black rounded-full py-0.5">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div className="space-y-7">
                <div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                      {product.subcategory || "General"}
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
                      {renderStars(product.rating, "w-5 h-5")}

                      <span className="text-sm font-black">
                        {Number(product.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-gray-500">
                      {product.numReviews || 0} buyer reviews
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                    <PackageCheck className="w-5 h-5 text-emerald-600 mb-2" />

                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Stock
                    </p>

                    <p
                      className={`text-sm font-black ${
                        isOutOfStock ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {stockText}
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

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-[1.7rem] border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-black text-gray-950 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-indigo-600" />
                    Product Description
                  </h2>

                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">
                    {product.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-slate-950 to-slate-900 text-white rounded-[1.7rem] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 shadow-2xl">
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                    {hasDiscount ? "Sale Price" : "Price"}
                  </p>

                  <p className="text-4xl font-black">
                    {hasDiscount && finalPrice === 0
                      ? "FREE"
                      : `NPR ${finalPrice.toLocaleString()}`}
                  </p>

                  {hasDiscount && (
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-sm text-slate-400 line-through font-bold">
                        NPR {originalPrice.toLocaleString()}
                      </p>

                      <span className="text-xs font-black text-emerald-400">
                        -{discountPercent}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={addToCart}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-black transition-all ${
                      isOutOfStock
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />

                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-sm font-black transition-all ${
                      isOutOfStock
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
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

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
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
                {renderStars(product.rating, "w-4 h-4")}

                {Number(product.rating || 0).toFixed(1)} Average
              </div>
            </div>

            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center bg-slate-50 border border-dashed border-gray-200 rounded-[1.7rem] p-10">
                <Quote className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                <p className="text-sm font-bold text-gray-500">
                  No reviews yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...product.reviews].reverse().map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-100 rounded-[1.5rem] p-5 bg-gradient-to-br from-slate-50 to-white"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-black text-gray-950">
                          {review.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>

                      {renderStars(review.rating)}
                    </div>

                    <p className="text-sm text-gray-700 mt-4">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canReview ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8 h-fit">
              <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-2">
                Share Your Opinion
              </p>

              <h2 className="text-2xl font-black text-gray-950 mb-2">
                Write a Review
              </h2>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Rating
                  </label>

                  {renderRatingInput()}
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
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
                    placeholder="Write your opinion..."
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-black text-white ${
                    reviewLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Send className="w-4 h-4" />

                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>

                <div className="flex items-start gap-2 text-xs text-gray-400 bg-slate-50 border border-gray-100 rounded-2xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />

                  <p>
                    Reviews are available only for products you purchased and
                    received.
                  </p>
                </div>
              </form>
            </div>
          ) : hasReviewed ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8 h-fit">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-black text-gray-950 mb-4">
                Review Submitted
              </h2>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <p className="font-bold text-green-700">
                  You have already reviewed this product.
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  Your review is visible in the buyer reviews section.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8 h-fit">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-black text-gray-950 mb-4">
                Review Locked
              </h2>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <p className="font-bold text-indigo-700">
                  Reviews are available only after:
                </p>

                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li>✓ Product purchased</li>
                  <li>✓ Order delivered or completed</li>
                  <li>✓ You have not already reviewed it</li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}