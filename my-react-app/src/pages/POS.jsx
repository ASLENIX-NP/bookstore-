
import React, { useState } from "react";
import axios from "axios";
import Scanner from "../components/Scanner";

export default function POS() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // Added loading state for the new checkout functionality
  const [loading, setLoading] = useState(false);

  // 🔥 ADD PRODUCT (SMART ERP ENGINE)
  const addProduct = async (barcode) => {
    try {
      setError("");

      const res = await axios.get(
        `http://localhost:5000/api/products/barcode/${barcode}`
      );

      const product = res.data;

      // ⚠️ LOW STOCK WARNING
      if (product.stock <= product.lowStockAlert || product.stock <= 5) {
        alert("⚠ Low Stock Warning: " + product.name);
      }

      // ➕ ADD TO CART
      setCart((prev) => {
        const exists = prev.find((p) => p._id === product._id);

        if (exists) {
          return prev.map((p) =>
            p._id === product._id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          );
        }

        return [...prev, { ...product, quantity: 1 }];
      });

      // 🔊 Beep sound
      new Audio("https://www.soundjay.com/button/beep-07.mp3").play().catch(e => console.log("Audio play failed", e));

    } catch (err) {
      setError("Product not found");

      // 🧠 SMART SUGGESTION SYSTEM
      try {
        const suggestion = await axios.get(
          "http://localhost:5000/api/products"
        );
        console.log("Suggested products:", suggestion.data.slice(0, 3));
      } catch (e) {
        console.log("Suggestion error");
      }
    }
  };

  // 🧾 TOTAL CALCULATION
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 💳 CHECKOUT (NEW LOGIC)
  const checkout = async () => {
    try {
      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }
  
      setLoading(true);
  
      const res = await axios.post(
        "http://localhost:5000/api/products/pos-checkout",
        {
          cart,
          paymentMethod,
        }
      );
  
      const orderId = res.data.orderId;
  
      setCart([]);
      setLoading(false);
  
      // ✅ REDIRECT TO INVOICE PAGE (MAIN FIX)
      window.location.href = `/invoice/${orderId}`;
  
    } catch (err) {
      setLoading(false);
      console.log(err);
      alert("Checkout failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

      {/* SCANNER SECTION */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold">📷 Smart Scanner</h2>
        <Scanner onScan={addProduct} />
      </div>

      {/* CART SECTION */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">
          🧾 Cashier Panel
        </h2>

        {error && (
          <p className="text-red-500 mb-2">{error}</p>
        )}

        {cart.map((item) => (
          <div
            key={item._id}
            className="flex justify-between border-b py-2"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>

            <p>Rs {item.price * item.quantity}</p>
          </div>
        ))}

        {/* TOTAL */}
        <div className="mt-4 text-xl font-bold">
          Total: Rs {total}
        </div>

        {/* PAYMENT METHOD */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setPaymentMethod("cash")}
            className={`px-3 py-2 rounded ${
              paymentMethod === "cash"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Cash
          </button>

          <button
            onClick={() => setPaymentMethod("card")}
            className={`px-3 py-2 rounded ${
              paymentMethod === "card"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Card
          </button>
        </div>

        {/* CHECKOUT */}
        <button
          onClick={checkout}
          disabled={loading || cart.length === 0}
          className={`w-full mt-4 py-3 rounded text-white transition-colors ${
            loading || cart.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Processing..." : "COMPLETE SALE"}
        </button>

      </div>
    </div>
  );
}