import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
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
    setSelectedItems(normalizedCart.map((item) => item._id));

    localStorage.setItem("cart", JSON.stringify(normalizedCart));
  }, [navigate]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) => updatedCart.some((item) => item._id === id))
    );
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
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10 space-y-7">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-gray-950">
                Your Shopping Cart
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Select products you want to checkout.
              </p>
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
              Add books or products first before checkout.
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
            {/* Select All */}
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

            {/* Cart Items */}
            <div className="bg-white rounded-[2rem] border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item._id);

                return (
                  <div
                    key={item._id}
                    className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => toggleItemSelection(item._id)}
                        className="text-indigo-600"
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
                        className="w-16 h-20 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0 shadow-sm"
                      />

                      <div>
                        <h4 className="font-black text-gray-900 line-clamp-1">
                          {item.title}
                        </h4>

                        <p className="text-sm text-slate-400 font-bold mt-1">
                          NPR {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-2 border border-gray-200 bg-slate-50 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateQty(item._id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="text-sm font-black px-2 text-gray-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQty(item._id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <span className="text-sm font-black text-slate-900">
                          NPR{" "}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout Summary */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Total Cart Estimate
                </p>

                <h3 className="text-2xl font-black text-slate-900">
                  NPR {cartSubtotal.toLocaleString()}
                </h3>

                <p className="text-sm text-gray-500">
                  Selected subtotal:{" "}
                  <span className="font-black text-gray-800">
                    NPR {selectedSubtotal.toLocaleString()}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={proceedToDelivery}
                disabled={selectedCartItems.length === 0}
                className={`w-full sm:w-auto text-white text-sm font-black py-4 px-7 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  selectedCartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-slate-950 hover:bg-slate-800"
                }`}
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