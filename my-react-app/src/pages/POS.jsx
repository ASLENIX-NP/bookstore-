import React, { useMemo, useState } from "react";
import axios from "axios";
import Scanner from "../components/Scanner";
import {
  ScanLine,
  ReceiptText,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Banknote,
  CreditCard,
  Barcode,
  PackageCheck,
  RefreshCw,
  Calculator,
  XCircle,
  Sparkles,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getProductImage = (image) => {
  if (!image) return FALLBACK_IMAGE;
  return image;
};

export default function POS() {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");

  const getItemPrice = (item) => {
    return Number(item.salePrice || item.price || 0);
  };

  const addProduct = async (barcode) => {
    const cleanBarcode = String(barcode || "").trim();

    if (!cleanBarcode) {
      setError("Please enter or scan a valid barcode.");
      return;
    }

    try {
      setError("");
      setLastScannedCode(cleanBarcode);

      const res = await axios.get(
        `http://localhost:5000/api/products/barcode/${cleanBarcode}`
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

  const handleManualAdd = (event) => {
    event.preventDefault();

    const code = manualBarcode.trim();

    if (!code) {
      setError("Please enter barcode first.");
      return;
    }

    addProduct(code);
    setManualBarcode("");
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

  const clearCart = () => {
    if (cart.length === 0) return;

    const confirmClear = window.confirm("Clear all products from POS cart?");
    if (!confirmClear) return;

    setCart([]);
    setError("");
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = Number(item.quantity || 1);

      return sum + price * quantity;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.quantity || 1);
    }, 0);
  }, [cart]);

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-8 shadow-xl shadow-slate-200">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <ScanLine className="w-4 h-4" />
              POS System
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Counter Billing Desk
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Scan barcode, add products to cart, collect payment, and generate
              VAT invoice instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Cart Items
              </p>

              <p className="text-2xl font-black text-white mt-1">
                {totalItems}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Bill Total
              </p>

              <p className="text-2xl font-black text-orange-300 mt-1">
                NPR {total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <p className="font-black">POS Alert</p>
            <p className="text-sm font-bold mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                    <Barcode className="w-4 h-4" />
                    Smart Scanner
                  </div>

                  <h2 className="text-xl font-black text-slate-950">
                    Scan Product Barcode
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Use camera scanner or enter barcode manually.
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ScanLine className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-indigo-50/40 p-3 overflow-hidden">
                <Scanner onScan={addProduct} />
              </div>

              <form onSubmit={handleManualAdd} className="mt-5">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.18em] mb-2">
                  Manual Barcode Entry
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Type or paste barcode..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </form>

              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />

                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Last Scan
                  </p>
                </div>

                <p className="font-mono text-sm font-black text-slate-800 mt-2 break-all">
                  {lastScannedCode || "No barcode scanned yet"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-[2rem] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Quick Summary
                </p>

                <h3 className="text-xl font-black text-gray-950">
                  NPR {total.toLocaleString()}
                </h3>

                <p className="text-sm text-gray-500">
                  {totalItems} item(s) in cashier cart
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="xl:col-span-3">
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                    <ReceiptText className="w-4 h-4" />
                    Cashier Panel
                  </div>

                  <h2 className="text-xl font-black text-slate-950">
                    Current Sale Cart
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Review quantity, payment method, and complete counter sale.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 border border-red-100 px-4 py-3 rounded-2xl text-sm font-black transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {cart.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-[2rem] p-12 text-center bg-slate-50">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />

                  <p className="text-sm font-black text-gray-500">
                    Scan products to add them here.
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Cart is empty. Use scanner or manual barcode entry.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const price = getItemPrice(item);
                    const quantity = Number(item.quantity || 1);
                    const lineTotal = price * quantity;

                    return (
                      <div
                        key={item._id}
                        className="bg-slate-50 border border-gray-100 rounded-[1.5rem] p-4 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          <div className="lg:col-span-5 flex items-center gap-3 min-w-0">
                            <img
                              src={getProductImage(item.image)}
                              alt={item.name}
                              className="w-14 h-16 rounded-2xl object-cover bg-white border border-gray-100 shrink-0"
                            />

                            <div className="min-w-0">
                              <p className="font-black text-gray-950 truncate">
                                {item.name}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                Rate: NPR {price.toLocaleString()} | Stock:{" "}
                                {Number(item.stock || 0)}
                              </p>

                              {item.barcode && (
                                <p className="text-[11px] font-mono text-indigo-500 mt-1 truncate">
                                  {item.barcode}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="lg:col-span-3 flex items-center justify-start lg:justify-center">
                            <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
                              <button
                                type="button"
                                onClick={() => decreaseQty(item._id)}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <span className="w-12 text-center font-black text-slate-950">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => increaseQty(item._id)}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="lg:col-span-3 lg:text-right">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Line Total
                            </p>

                            <p className="font-black text-lg text-emerald-600 mt-1">
                              NPR {lineTotal.toLocaleString()}
                            </p>
                          </div>

                          <div className="lg:col-span-1 flex lg:justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(item._id)}
                              className="w-10 h-10 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-900 text-white p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total Payable
                    </p>

                    <h3 className="text-3xl sm:text-4xl font-black mt-2">
                      NPR {total.toLocaleString()}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      {totalItems} item(s) • {cart.length} product row(s)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Payment Method
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cash")}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                            paymentMethod === "cash"
                              ? "bg-green-500 text-white shadow-lg shadow-green-950/20"
                              : "bg-white/10 text-slate-300 hover:bg-white/15"
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          Cash
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                            paymentMethod === "card"
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-950/20"
                              : "bg-white/10 text-slate-300 hover:bg-white/15"
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          Card
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={checkout}
                      disabled={loading || cart.length === 0}
                      className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all ${
                        loading || cart.length === 0
                          ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-lg shadow-orange-950/20"
                      }`}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Sale...
                        </>
                      ) : (
                        <>
                          <ReceiptText className="w-4 h-4" />
                          Complete Sale & Print Invoice
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}