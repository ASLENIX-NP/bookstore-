import { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Journal",
      price: 24.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1518226203301-8e7f833c6a94",
    },
  ]);

  const updateQty = (id, delta) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-indigo-600 font-medium">
                    ${item.price}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1 border rounded"
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1 border rounded"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
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