import React, { useEffect, useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to view your cart.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, [navigate]);

  const saveCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQty = (id, delta) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    saveCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    saveCart(updatedCart);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Your cart is empty</p>

          <Link
            to="/products"
            className="text-white bg-indigo-600 px-5 py-2 rounded"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id || item._id}
                className="flex items-center gap-4 border p-4 rounded bg-white"
              >
                <img
                  src={item.image}
                  alt={item.name || item.title}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item.name || item.title}
                  </h3>

                  <p className="text-indigo-600 font-medium">
                    ${Number(item.price || 0).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id || item._id, -1)}
                      className="p-1 border rounded"
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity || 1}</span>

                    <button
                      type="button"
                      onClick={() => updateQty(item.id || item._id, 1)}
                      className="p-1 border rounded"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id || item._id)}
                      className="ml-4 text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-4 flex justify-between">
            <h2 className="text-xl font-bold">Total</h2>
            <h2 className="text-xl font-bold text-indigo-600">
              ${subtotal.toFixed(2)}
            </h2>
          </div>
        </>
      )}
    </div>
  );
}