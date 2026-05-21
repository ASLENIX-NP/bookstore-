import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  PackageCheck,
  Truck,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DELIVERY_CHARGE = 100;

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
    description: "Pay using Khalti wallet.",
    icon: <Wallet className="w-6 h-6" />,
    status: "Available Soon",
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

export default function CheckoutPayment() {
  const navigate = useNavigate();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to continue payment.");
      navigate("/login", { state: { from: "/checkout/payment" } });
      return;
    }

    const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    const address = JSON.parse(
      localStorage.getItem("selectedDeliveryAddress") || "null"
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

  const productSubtotal = checkoutItems.reduce((total, item) => {
    return (
      total +
      Number(item.price || 0) * Number(item.quantity || item.qty || 1)
    );
  }, 0);

  const grandTotal = productSubtotal + DELIVERY_CHARGE;

  const handleConfirmPaymentMethod = () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const selectedMethod = paymentMethods.find(
      (method) => method.id === selectedPaymentMethod
    );

    const checkoutSummary = {
      deliveryAddress,
      orderItems: checkoutItems,
      productSubtotal,
      deliveryCharge: DELIVERY_CHARGE,
      grandTotal,
      paymentMethod: selectedMethod?.title || "Cash on Delivery",
      paymentMethodId: selectedPaymentMethod,
      checkoutType: localStorage.getItem("checkoutType") || "Cart",
    };

    localStorage.setItem("checkoutSummary", JSON.stringify(checkoutSummary));

    alert(
      `Payment method selected: ${selectedMethod?.title}. Next step will save this order to admin orders.`
    );
  };

  if (!deliveryAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
        {/* Header */}
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
                Review your selected products, delivery address, and choose a
                payment method.
              </p>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl px-6 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Grand Total
              </p>
              <p className="text-3xl font-black">
                NPR {grandTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-7">
            {/* Delivery Address */}
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

            {/* Product Items */}
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
                  const subtotal = price * qty;

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
                            Price:{" "}
                            <span className="font-black text-gray-800">
                              NPR {price.toLocaleString()}
                            </span>
                          </p>

                          <p className="text-gray-500">
                            Subtotal:{" "}
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

          {/* Right Side */}
          <div className="space-y-7">
            {/* Payment Methods */}
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

            {/* Price Summary */}
            <section className="bg-slate-950 text-white rounded-[2rem] shadow-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <PackageCheck className="w-5 h-5 text-orange-300" />
                <h2 className="text-xl font-black">Payment Summary</h2>
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
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all"
              >
                Confirm Payment Method
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Order creation will be connected in the next step.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}