import React, { useState } from "react";
import axios from "axios";
import Scanner from "../components/Scanner";

export default function POS() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  const addProduct = async (barcode) => {
    try {
      setError("");

      const res = await axios.get(
        `http://localhost:5000/api/products/barcode/${barcode}`
      );

      const product = res.data.product || res.data.data || res.data;

      if (!product || !product._id) {
        throw new Error("Product not found");
      }

      const availableStock = Number(product.stock || 0);

      if (availableStock <= 0) {
        const message = `${product.name} is out of stock`;
        setError(message);
        alert(message);
        return;
      }

      if (
        availableStock <= Number(product.lowStockAlert || 5) ||
        availableStock <= 5
      ) {
        alert("⚠ Low Stock Warning: " + product.name);
      }

      setCart((prev) => {
        const exists = prev.find((item) => item._id === product._id);

        if (exists) {
          const nextQuantity = Number(exists.quantity || 1) + 1;

          if (nextQuantity > availableStock) {
            alert(`Only ${availableStock} stock available for ${product.name}`);
            return prev;
          }

          return prev.map((item) =>
            item._id === product._id
              ? {
                  ...item,
                  quantity: nextQuantity,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            ...product,
            quantity: 1,
          },
        ];
      });

      new Audio("https://www.soundjay.com/button/beep-07.mp3")
        .play()
        .catch(() => {});
    } catch (err) {
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Product not found";

      setError(backendMessage);
      alert(backendMessage);
    }
  };

  const increaseQty = (productId) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;

        const availableStock = Number(item.stock || 0);
        const nextQuantity = Number(item.quantity || 1) + 1;

        if (nextQuantity > availableStock) {
          alert(`Only ${availableStock} stock available for ${item.name}`);
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      })
    );
  };

  const decreaseQty = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === productId
            ? {
                ...item,
                quantity: Number(item.quantity || 1) - 1,
              }
            : item
        )
        .filter((item) => Number(item.quantity || 0) > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const total = cart.reduce((sum, item) => {
    const price = Number(item.salePrice || item.price || 0);
    const quantity = Number(item.quantity || 1);

    return sum + price * quantity;
  }, 0);

  const checkout = async () => {
    try {
      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      setLoading(true);
      setError("");

      const checkoutCart = cart.map((item) => ({
        _id: item._id,
        productId: item._id,
        name: item.name,
        title: item.name,
        price: Number(item.salePrice || item.price || 0),
        quantity: Number(item.quantity || 1),
        qty: Number(item.quantity || 1),
        image: item.image || "",
      }));

      const res = await axios.post(
        "http://localhost:5000/api/products/pos-checkout",
        {
          cart: checkoutCart,
          paymentMethod,
        }
      );

      const orderId = res.data.orderId || res.data.order?._id;

      if (!orderId) {
        throw new Error("POS sale completed but order ID was not returned");
      }

      setCart([]);
      setLoading(false);

      window.location.href = `/invoice/${orderId}`;
    } catch (err) {
      setLoading(false);

      console.error("POS checkout error:", err);

      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Checkout failed";

      setError(backendMessage);
      alert(backendMessage);
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
        <h2 className="text-lg font-bold mb-4">🧾 Cashier Panel</h2>

        {error && <p className="text-red-500 mb-3 font-semibold">{error}</p>}

        {cart.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 font-semibold">
            Scan products to add them here.
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => {
              const price = Number(item.salePrice || item.price || 0);
              const quantity = Number(item.quantity || 1);

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b py-3 gap-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>

                    <p className="text-sm text-gray-500">
                      Rate: Rs {price} | Stock: {Number(item.stock || 0)}
                    </p>

                    <p className="text-sm text-gray-500">Qty: {quantity}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decreaseQty(item._id)}
                      className="w-8 h-8 rounded bg-gray-200 font-bold"
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQty(item._id)}
                      className="w-8 h-8 rounded bg-gray-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">Rs {price * quantity}</p>

                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="text-xs text-red-500 font-bold mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOTAL */}
        <div className="mt-4 text-xl font-bold">
          Total: Rs {total.toLocaleString()}
        </div>

        {/* PAYMENT METHOD */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
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
            type="button"
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
          type="button"
          onClick={checkout}
          disabled={loading || cart.length === 0}
          className={`w-full mt-4 py-3 rounded text-white transition-colors ${
            loading || cart.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Processing..." : "COMPLETE SALE"}
        </button>
      </div>
    </div>
  );
}