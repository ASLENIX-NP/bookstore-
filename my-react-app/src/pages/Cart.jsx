import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Minus,
  Plus,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getSafeImage = (image) => {
  if (!image) return FALLBACK_IMAGE;

  if (String(image).startsWith("data:image")) {
    return FALLBACK_IMAGE;
  }

  return image;
};

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to view your cart.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    const localCartData = localStorage.getItem("cart");
    const savedCart = localCartData ? JSON.parse(localCartData) : [];

    const normalizedCart = savedCart.map((item, index) => {
      const productId =
        item.productId || item._id || item.id || `cart-item-${index}`;

      return {
        _id: productId,
        productId,
        title: item.title || item.name || "Product",
        name: item.name || item.title || "Product",
        price: Number(item.price || 0),
        image: getSafeImage(item.image),
        quantity: Number(item.quantity || item.qty || 1),
      };
    });

    setCartItems(normalizedCart);

    // Cart items should be unselected first.
    setSelectedItems([]);

    localStorage.setItem("cart", JSON.stringify(normalizedCart));
  }, [navigate]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) => updatedCart.some((item) => item._id === id))
    );

    window.dispatchEvent(new Event("storage"));
  };

  const updateQty = (id, delta) => {
    const updatedCart = cartItems.map((item) => {
      if (item._id === id) {
        return {
          ...item,
          quantity: Math.max(1, Number(item.quantity || 1) + delta),
        };
      }

      return item;
    });

    saveCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    saveCart(updatedCart);
    toast.success("Item removed from cart");
  };

  const toggleItemSelection = (id) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((itemId) => itemId !== id);
      }

      return [...prevSelected, id];
    });
  };

  const toggleSelectAll = () => {
    if (cartItems.length === 0) return;

    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item._id));
    }
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item._id)
  );

  const cartSubtotal = cartItems.reduce((acc, item) => {
    return acc + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  const selectedSubtotal = selectedCartItems.reduce((acc, item) => {
    return acc + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  const proceedToDelivery = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to checkout.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one product to checkout.");
      return;
    }

    const checkoutItems = selectedCartItems.map((item) => ({
      _id: item._id,
      productId: item.productId || item._id,
      title: item.title || item.name || "Product",
      name: item.name || item.title || "Product",
      price: Number(item.price || 0),
      image: getSafeImage(item.image),
      quantity: Number(item.quantity || 1),
      qty: Number(item.quantity || 1),
      subtotal: Number(item.price || 0) * Number(item.quantity || 1),
    }));

    localStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
    localStorage.setItem("checkoutType", "Cart");

    navigate("/checkout/delivery");
  };

  const allSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-10 space-y-7">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
                Your Shopping Cart
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Select products you want to checkout.
              </p>

              <div className="mt-4">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    style={{
                      width: `${
                        cartItems.length
                          ? (selectedCartItems.length / cartItems.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 p-8">
            <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />

            <p className="text-lg font-black text-gray-800">
              Your shopping cart is empty.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Add books or products first before checkout please.
            </p>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black px-6 py-3 rounded-2xl shadow-sm cursor-pointer transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-2 text-sm font-black text-gray-700 hover:text-indigo-600"
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}

                {allSelected ? "Unselect All" : "Select All"}
              </button>

              <p className="text-sm text-gray-500">
                Selected:{" "}
                <span className="font-black text-gray-950">
                  {selectedCartItems.length}
                </span>{" "}
                of{" "}
                <span className="font-black text-gray-950">
                  {cartItems.length}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item._id);

                return (
                  <div
                    key={item._id}
                    className="relative overflow-hidden bg-red-500"
                  >
                    <div className="absolute right-0 top-0 h-full w-24 sm:w-32 bg-red-500 flex items-center justify-center text-white font-black">
                      Delete
                    </div>

                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -110, right: 0 }}
                      dragElastic={0.1}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -95) {
                          removeItem(item._id);
                        }
                      }}
                      className="relative bg-white hover:bg-slate-50 transition-all duration-300 border-b border-slate-100 p-3 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5">
                        <div className="flex items-start gap-2.5 sm:gap-4 w-full min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleItemSelection(item._id)}
                            className="text-indigo-600 shrink-0 mt-9 sm:mt-10"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-6 h-6" />
                            ) : (
                              <Square className="w-6 h-6 text-gray-400" />
                            )}
                          </button>

                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl shadow-md border border-slate-100 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-xs text-indigo-600 font-bold uppercase">
                              PatraPatrika
                            </p>

                            <h4 className="font-black text-base sm:text-lg text-slate-900 mt-1 break-words leading-snug">
                              {item.title}
                            </h4>

                            <p className="text-sm text-slate-400 mt-1">
                              Books & Stationery
                            </p>

                            <div className="mt-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-orange-500 text-lg sm:text-xl font-black">
                                  NPR{" "}
                                  {Number(item.price || 0).toLocaleString()}
                                </span>

                                <span className="text-slate-400 line-through text-xs sm:text-sm">
                                  NPR{" "}
                                  {Math.round(
                                    Number(item.price || 0) * 1.2
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-bold text-slate-600">
                                Total: NPR{" "}
                                {(
                                  Number(item.price || 0) *
                                  Number(item.quantity || 1)
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end pl-0">
                          <div className="w-full max-w-[145px] sm:max-w-none flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-md h-11 sm:h-14 px-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQty(item._id, -1)}
                              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-indigo-50 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="w-9 sm:w-12 text-center font-black text-base sm:text-lg text-slate-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQty(item._id, 1)}
                              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-indigo-50 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 sm:p-8 rounded-[2rem] shadow-xl border border-indigo-100 mt-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-bold">
                    🚚 Fast Delivery Available
                  </div>
                </div>

                <p className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                  Total Cart Estimate
                </p>

                <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                  NPR {cartSubtotal.toLocaleString()}
                </h3>

                <p className="text-base text-slate-600">
                  Selected subtotal:{" "}
                  <span className="font-black text-indigo-600">
                    NPR {selectedSubtotal.toLocaleString()}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={proceedToDelivery}
                className="mt-6 w-full sm:w-auto text-white text-sm font-black py-4 px-7 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 hover:shadow-xl duration-300"
              >
                Checkout Selected
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}