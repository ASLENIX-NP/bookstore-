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

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to view your cart.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    const localCartData = localStorage.getItem("cart");
    const savedCart = localCartData ? JSON.parse(localCartData) : [];

    const normalizedCart = savedCart.map((item) => ({
      _id: item._id,
      title: item.title || item.name || "Product",
      name: item.name || item.title || "Product",
      price: Number(item.price || 0),
      image:
        item.image ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
      quantity: Number(item.quantity || 1),
    }));

    setCartItems(normalizedCart);
    setSelectedItems(normalizedCart.map((item) => item._id));
  }, [navigate]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) =>
        updatedCart.some((item) => item._id === id)
      )
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

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const selectedSubtotal = selectedCartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const proceedToDelivery = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to checkout.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (selectedCartItems.length === 0) {
      alert("Please select at least one product to checkout.");
      return;
    }

    const checkoutItems = selectedCartItems.map((item) => ({
      _id: item._id,
      productId: item._id,
      title: item.title || item.name,
      name: item.name || item.title,
      price: Number(item.price || 0),
      image: item.image,
      quantity: Number(item.quantity || 1),
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
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <ShoppingCart className="w-4 h-4" />
                Shopping Cart
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-950">
                Your Cart
              </h1>

              <p className="text-gray-500 mt-2">
                Select one product, multiple products, or all products before checkout.
              </p>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black transition-all"
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {allSelected ? "Unselect All" : "Select All"}
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 p-8 shadow-sm">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-black text-gray-400">
              Your shopping cart is empty.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="mt-5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm cursor-pointer transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item._id);

                return (
                  <div
                    key={item._id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isSelected ? "bg-indigo-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => toggleItemSelection(item._id)}
                        className="shrink-0 text-indigo-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-6 h-6" />
                        ) : (
                          <Square className="w-6 h-6 text-gray-400" />
                        )}
                      </button>

                      <img
                        src={item.image}
                        alt={item.title || item.name}
                        className="w-16 h-20 object-cover rounded-2xl bg-gray-50 border border-gray-100 shrink-0 shadow-sm"
                      />

                      <div>
                        <h4 className="font-black text-sm text-gray-950 tracking-tight">
                          {item.title || item.name}
                        </h4>

                        <p className="text-xs text-slate-400 font-bold mt-1">
                          NPR {Number(item.price || 0).toLocaleString()}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Subtotal: NPR{" "}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-2 border border-gray-200 bg-slate-50 p-1 rounded-xl">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="text-xs font-black px-2 text-gray-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item._id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-xs font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Checkout Selection
                </p>

                <h3 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
                  {selectedCartItems.length} item
                  {selectedCartItems.length !== 1 ? "s" : ""} selected
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Only selected products will move to delivery and payment.
                </p>
              </div>

              <div className="bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Cart Total
                </p>

                <h3 className="text-2xl font-black tracking-tight mt-1">
                  NPR {cartSubtotal.toLocaleString()}
                </h3>

                <div className="border-t border-white/10 my-4" />

                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Selected Subtotal
                </p>

                <h3 className="text-3xl font-black tracking-tight mt-1">
                  NPR {selectedSubtotal.toLocaleString()}
                </h3>

                <button
                  type="button"
                  onClick={proceedToDelivery}
                  className="mt-5 w-full bg-orange-500 text-white hover:bg-orange-600 text-sm font-black py-4 px-6 rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  Checkout Selected
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}