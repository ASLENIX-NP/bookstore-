import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

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
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover"
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

                  <p className="text-slate-500 line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-slate-900">
                      NPR {product.price}
                    </h3>

                    <Link
                      to={`/products/${product._id}`}
                      className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white font-black transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}