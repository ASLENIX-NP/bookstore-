import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Truck,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DELIVERY_CHARGE = 100;
const VAT_RATE = 13;

const paymentMethods = [
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Pay securely using your bank card.",
    icon: <CreditCard className="w-6 h-6" />,
    status: "Available Soon",
  },
  {
    id: "khalti",
    title: "Khalti",
    description: "Pay now using Khalti wallet or Khalti gateway.",
    icon: <Wallet className="w-6 h-6" />,
    status: "Ready",
  },
  {
    id: "esewa",
    title: "eSewa",
    description: "Pay using eSewa wallet.",
    icon: <Smartphone className="w-6 h-6" />,
    status: "Available Soon",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order is delivered.",
    icon: <Banknote className="w-6 h-6" />,
    status: "Ready",
  },
];

const roundMoney = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
};

export default function CheckoutPayment() {
  const navigate = useNavigate();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to continue payment.");
      navigate("/login", { state: { from: "/checkout/payment" } });
      return;
    }

    let items = safeJsonParse(localStorage.getItem("checkoutItems"), []);

    // Safety fallback: if checkoutItems is missing, recover from cart.
    if (!Array.isArray(items) || items.length === 0) {
      const cartItems = safeJsonParse(localStorage.getItem("cart"), []);

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        items = cartItems.map((item) => {
          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.price || 0);

          return {
            _id: item._id || item.productId || item.id,
            productId: item.productId || item._id || item.id,
            title: item.title || item.name || "Product",
            name: item.name || item.title || "Product",
            price,
            image: item.image || "",
            quantity: qty,
            qty,
            subtotal: roundMoney(price * qty),
          };
        });

        localStorage.setItem("checkoutItems", JSON.stringify(items));
        localStorage.setItem("checkoutType", "Cart");
      }
    }

    const address = safeJsonParse(
      localStorage.getItem("selectedDeliveryAddress"),
      null
    );

    if (!items || items.length === 0) {
      alert("No checkout products found. Please select products first.");
      navigate("/cart");
      return;
    }

    if (!address) {
      alert("Please select delivery address first.");
      navigate("/checkout/delivery");
      return;
    }

    setCheckoutItems(items);
    setDeliveryAddress(address);
  }, [navigate]);

  const getLoggedUser = () => {
    try {
      const user =
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("currentUser") || "null") ||
        JSON.parse(localStorage.getItem("authUser") || "null");

      return user;
    } catch {
      return null;
    }
  };

  const productSubtotal = roundMoney(
    checkoutItems.reduce((total, item) => {
      return (
        total +
        Number(item.price || 0) * Number(item.quantity || item.qty || 1)
      );
    }, 0)
  );

  const taxableAmount = roundMoney(productSubtotal + DELIVERY_CHARGE);
  const vatAmount = roundMoney((taxableAmount * VAT_RATE) / 100);
  const grandTotal = roundMoney(taxableAmount + vatAmount);

  const createOrderPayload = (selectedMethod) => {
    const loggedUser = getLoggedUser();

    return {
      customerName:
        deliveryAddress.fullName ||
        loggedUser?.name ||
        loggedUser?.firstName ||
        "Guest Customer",

      email:
        loggedUser?.email ||
        localStorage.getItem("email") ||
        "customer@patrapatrikacenter.local",

      phone: deliveryAddress.phone || "",

      deliveryInfo: {
        fullName: deliveryAddress.fullName || "",
        phone: deliveryAddress.phone || "",
        region: deliveryAddress.region || "",
        city: deliveryAddress.city || "",
        building: deliveryAddress.building || "",
        area: deliveryAddress.area || "",
        address: deliveryAddress.address || "",
        label: deliveryAddress.label || "Home",
      },

      orderItems: checkoutItems.map((item) => {
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || 0);

        return {
          productId: item.productId || item._id,
          title: item.title || item.name || "Product",
          image: item.image || "",
          qty,
          price,
          subtotal: roundMoney(price * qty),
        };
      }),

      productSubtotal,
      deliveryCharge: DELIVERY_CHARGE,
      taxableAmount,
      vatRate: VAT_RATE,
      vatAmount,
      grandTotal,
      totalPrice: grandTotal,

      checkoutType: localStorage.getItem("checkoutType") || "Cart",

      paymentMethod: selectedMethod.title,
      paymentMethodId: selectedMethod.id,

      paymentStatus: "Pending",
      orderStatus: "Processing",
      transactionId: "",
      paymentProof: "",
    };
  };

  const getErrorMessage = (error) => {
    const serverError = error.response?.data?.error;

    if (typeof serverError === "string") return serverError;

    if (serverError?.detail) return serverError.detail;

    if (serverError) return JSON.stringify(serverError);

    return "Failed to create order/payment. Your cart is still saved.";
  };

  const handleConfirmPaymentMethod = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const selectedMethod = paymentMethods.find(
      (method) => method.id === selectedPaymentMethod
    );

    if (!selectedMethod) {
      alert("Invalid payment method selected.");
      return;
    }

    if (!["cod", "khalti"].includes(selectedMethod.id)) {
      alert(`${selectedMethod.title} is not available yet. Please use COD or Khalti.`);
      return;
    }

    try {
      setOrderLoading(true);

      const orderPayload = createOrderPayload(selectedMethod);

      const orderResponse = await axios.post(
        "http://localhost:5000/api/orders",
        orderPayload
      );

      if (!orderResponse.data.success) {
        alert("Failed to place order. Please try again.");
        return;
      }

      const createdOrder = orderResponse.data.order;
      localStorage.setItem("lastOrder", JSON.stringify(createdOrder));

      // KHALTI FLOW:
      // Do not clear cart or checkoutItems here.
      // Payment must be verified by backend callback first.
      if (selectedMethod.id === "khalti") {
        const khaltiResponse = await axios.post(
          "http://localhost:5000/api/payments/khalti/initiate",
          {
            orderId: createdOrder._id,
          }
        );

        if (!khaltiResponse.data.success || !khaltiResponse.data.payment_url) {
          alert("Khalti payment could not be started. Your cart is still saved.");
          return;
        }

        window.location.href = khaltiResponse.data.payment_url;
        return;
      }

      // CASH ON DELIVERY FLOW:
      // Do not clear cart or checkoutItems here.
      // This prevents your cart becoming empty during testing.
      alert("Order placed successfully! Admin can now see this order.");
      navigate("/order-success");
    } catch (error) {
      console.error("Order/payment creation error:", error);
      alert(getErrorMessage(error));
    } finally {
      setOrderLoading(false);
    }
  };

  if (!deliveryAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <button
            type="button"
            onClick={() => navigate("/checkout/delivery")}
            className="inline-flex items-center gap-2 text-sm font-black text-gray-600 hover:text-orange-600 mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Delivery
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <ShieldCheck className="w-4 h-4" />
                Secure Checkout
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-950">
                Order Summary & Payment
              </h1>

              <p className="text-gray-500 mt-2">
                Review your products, delivery address, VAT, and payment method.
              </p>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl px-6 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Grand Total With VAT
              </p>
              <p className="text-3xl font-black">
                NPR {grandTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 space-y-7">
            <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    Delivery Location
                  </p>
                  <h2 className="text-2xl font-black text-gray-950 mt-1">
                    {deliveryAddress.label}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout/delivery")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2 rounded-xl"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <User className="w-5 h-5 text-indigo-600 mb-2" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-1">
                    {deliveryAddress.fullName}
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <Phone className="w-5 h-5 text-orange-600 mb-2" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-1">
                    {deliveryAddress.phone}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-slate-50 border border-gray-100 rounded-2xl p-4">
                <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Address
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-1 leading-relaxed">
                  {deliveryAddress.building}, {deliveryAddress.area},{" "}
                  {deliveryAddress.city}, {deliveryAddress.region}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {deliveryAddress.address}
                </p>
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Selected Products
                </p>
                <h2 className="text-2xl font-black text-gray-950 mt-1">
                  {checkoutItems.length} item
                  {checkoutItems.length !== 1 ? "s" : ""} in this order
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {checkoutItems.map((item) => {
                  const qty = Number(item.quantity || item.qty || 1);
                  const price = Number(item.price || 0);
                  const subtotal = roundMoney(price * qty);

                  return (
                    <div
                      key={item._id || item.productId}
                      className="p-5 flex items-center gap-4"
                    >
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
                        }
                        alt={item.title || item.name}
                        className="w-20 h-24 object-cover rounded-2xl border border-gray-100 bg-slate-50"
                      />

                      <div className="flex-1">
                        <h3 className="font-black text-gray-950 text-sm sm:text-base">
                          {item.title || item.name}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
                          <p className="text-gray-500">
                            Qty:{" "}
                            <span className="font-black text-gray-800">
                              {qty}
                            </span>
                          </p>

                          <p className="text-gray-500">
                            Rate:{" "}
                            <span className="font-black text-gray-800">
                              NPR {price.toLocaleString()}
                            </span>
                          </p>

                          <p className="text-gray-500">
                            Amount:{" "}
                            <span className="font-black text-gray-800">
                              NPR {subtotal.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-7">
            <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Payment Method
              </p>

              <h2 className="text-2xl font-black text-gray-950 mt-1 mb-5">
                Choose Payment
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full text-left border rounded-2xl p-4 transition-all ${
                        isSelected
                          ? "border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50"
                          : "border-gray-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {method.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-black text-gray-950">
                              {method.title}
                            </h3>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            {method.description}
                          </p>

                          <p
                            className={`text-[10px] font-black uppercase tracking-widest mt-2 ${
                              method.status === "Ready"
                                ? "text-emerald-600"
                                : "text-orange-500"
                            }`}
                          >
                            {method.status}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-slate-950 text-white rounded-[2rem] shadow-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Receipt className="w-5 h-5 text-orange-300" />
                <h2 className="text-xl font-black">VAT Summary</h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Product Subtotal</span>
                  <span className="font-black">
                    NPR {productSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Charge
                  </span>
                  <span className="font-black">
                    NPR {DELIVERY_CHARGE.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Taxable Amount</span>
                  <span className="font-black">
                    NPR {taxableAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">VAT {VAT_RATE}%</span>
                  <span className="font-black">
                    NPR {vatAmount.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-white font-black">Grand Total</span>
                  <span className="text-3xl font-black">
                    NPR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmPaymentMethod}
                disabled={orderLoading}
                className={`mt-6 w-full text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  orderLoading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : selectedPaymentMethod === "khalti" ? (
                  "Pay with Khalti"
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Cart and checkout data will remain saved while payment is being processed.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}