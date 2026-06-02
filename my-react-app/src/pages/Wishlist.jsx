import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const CART_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

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
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
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

const ProductImage = ({ src, alt }) => {
  const handleError = (event) => {
    event.currentTarget.src = CART_IMAGE_PLACEHOLDER;
  };

  return (
    <img
      src={src || CART_IMAGE_PLACEHOLDER}
      alt={alt || "Product"}
      onError={handleError}
      className="w-full h-72 object-cover"
    />
  );
};

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (event, id) => {
    event.preventDefault();
    event.stopPropagation();

    const updatedWishlist = wishlist.filter(
      (item) => item._id !== id
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
          </div>

          <div>
            <h1 className="text-4xl font-black text-slate-900">
              My Wishlist
            </h1>

            <p className="text-slate-500 font-medium">
              Your favorite saved products
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-5" />

            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Wishlist is empty
            </h2>

            <p className="text-slate-500 mb-8">
              Add products to wishlist first.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {wishlist.map((product) => {
              const originalPrice = getOriginalPrice(product);
              const finalPrice = getFinalPrice(product);
              const hasDiscount = hasValidSalePrice(product);
              const discountPercent = getDiscountPercent(product);

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
                >
                  <div className="relative">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                    />

                    <button
                      type="button"
                      onClick={(event) =>
                        removeFromWishlist(event, product._id)
                      }
                      className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                      {product.name}
                    </h2>

                    <p className="text-slate-500 line-clamp-2 mb-4 min-h-[48px]">
                      {product.description ||
                        product.details ||
                        "Open this product to view complete information."}
                    </p>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p
                          className={`text-3xl font-black ${
                            hasDiscount ? "text-[#f57224]" : "text-slate-900"
                          }`}
                        >
                          {hasDiscount && finalPrice === 0
                            ? "FREE"
                            : `NPR ${finalPrice.toLocaleString()}`}
                        </p>

                        {hasDiscount && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-slate-400 line-through font-bold">
                              NPR {originalPrice.toLocaleString()}
                            </p>

                            <span className="text-xs font-black text-emerald-600">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/products/${product._id}`}
                        className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white font-black transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}