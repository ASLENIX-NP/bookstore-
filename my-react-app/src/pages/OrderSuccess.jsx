import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  PackageCheck,
  CreditCard,
  Truck,
  ShoppingBag,
  Home,
  ArrowRight,
  XCircle,
  Clock,
  Receipt,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryOrderId = searchParams.get("orderId");
  const queryPaymentStatus = searchParams.get("paymentStatus");
  const queryPayment = searchParams.get("payment");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        if (queryOrderId) {
          const response = await axios.get(
            `http://localhost:5000/api/orders/${queryOrderId}`
          );

          setOrder(response.data);
          localStorage.setItem("lastOrder", JSON.stringify(response.data));
          return;
        }

        const lastOrder = JSON.parse(localStorage.getItem("lastOrder") || "null");

        if (!lastOrder) {
          navigate("/products");
          return;
        }

        setOrder(lastOrder);
      } catch (error) {
        console.error("Order success load error:", error);
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [navigate, queryOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const paymentStatus = order.paymentStatus || "Pending";
  const isPaid = paymentStatus === "Paid";
  const isFailed =
    paymentStatus === "Failed" || queryPaymentStatus === "failed";

  const headerConfig = isFailed
    ? {
        bg: "from-red-600 to-rose-700",
        icon: <XCircle className="w-12 h-12 text-white" />,
        title: "Payment Not Completed",
        text:
          queryPayment === "khalti"
            ? "Your Khalti payment was cancelled, expired, or failed."
            : queryPayment === "esewa"
            ? "Your eSewa payment was cancelled or failed."
            : queryPayment === "card"
            ? "Your card payment was cancelled or failed."
            : "Your order could not be completed.",
      }
    : isPaid
    ? {
        bg: "from-emerald-600 to-green-700",
        icon: <CheckCircle2 className="w-12 h-12 text-white" />,
        title: "Payment Successful!",
        text: "Your payment has been verified and your order is confirmed.",
      }
    : {
        bg: "from-amber-500 to-orange-600",
        icon: <Clock className="w-12 h-12 text-white" />,
        title: "Order Placed Successfully!",
        text: "Your order is pending payment confirmation.",
      };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl overflow-hidden">
          <div
            className={`bg-gradient-to-br ${headerConfig.bg} text-white p-8 sm:p-10 text-center`}
          >
            <div className="w-20 h-20 bg-white/15 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-5">
              {headerConfig.icon}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black">
              {headerConfig.title}
            </h1>

            <p className="text-white/85 mt-3 text-base sm:text-lg">
              {headerConfig.text}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5">
                <PackageCheck className="w-6 h-6 text-indigo-600 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Order ID
                </p>
                <p className="font-mono text-sm font-black text-gray-950 mt-1">
                  #{order._id?.substring(0, 12)}
                </p>
              </div>

              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5">
                <CreditCard className="w-6 h-6 text-orange-600 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Payment Method
                </p>
                <p className="text-sm font-black text-gray-950 mt-1">
                  {order.paymentMethod || "Cash on Delivery"}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Status: {paymentStatus}
                </p>
              </div>

              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5">
                <Truck className="w-6 h-6 text-emerald-600 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Order Status
                </p>
                
                <p className="text-sm font-black text-gray-950 mt-1">
                  {order.orderStatus || order.status || "Processing"}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 text-white rounded-[2rem] p-6">
              <h2 className="text-xl font-black mb-5">VAT Payment Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Product Subtotal</span>
                  <span className="font-black">
                    NPR {Number(order.productSubtotal || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Delivery Charge</span>
                  <span className="font-black">
                    NPR {Number(order.deliveryCharge || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Taxable Amount</span>
                  <span className="font-black">
                    NPR {Number(order.taxableAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">
                    VAT {Number(order.vatRate ?? 13)}%
                  </span>
                  <span className="font-black">
                    NPR {Number(order.vatAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between">
                  <span className="text-white font-black">Grand Total</span>
                  <span className="text-3xl font-black">
                    NPR {Number(order.totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">
                Delivery Address
              </p>

              <h3 className="text-xl font-black text-gray-950">
                {order.deliveryInfo?.label || "Home"}
              </h3>

              <p className="text-sm font-bold text-gray-700 mt-3">
                {order.deliveryInfo?.fullName || order.customerName}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {order.deliveryInfo?.phone || order.phone}
              </p>

              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {order.deliveryInfo?.building}, {order.deliveryInfo?.area},{" "}
                {order.deliveryInfo?.city}, {order.deliveryInfo?.region}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {order.deliveryInfo?.address}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Ordered Products
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="p-5 flex items-center gap-4">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
                      }
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-2xl border border-gray-100 bg-slate-50"
                    />

                    <div className="flex-1">
                      <h4 className="font-black text-gray-950">
                        {item.title}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.qty} | NPR{" "}
                        {Number(item.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <p className="font-black text-gray-950">
                      NPR {Number(item.subtotal || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl inline-flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Link>

              <Link
                to="/my-orders"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl inline-flex items-center justify-center gap-2 transition-all"
              >
                <PackageCheck className="w-5 h-5" />
                My Orders
              </Link>

              {isPaid ? (
                <Link
                  to={`/invoice/${order._id}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Receipt className="w-5 h-5" />
                  View Invoice
                </Link>
              ) : (
                <Link
                  to="/"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-4 rounded-2xl inline-flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Back Home
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
{/* Delivery Estimate */}
<div className="bg-white border border-gray-100 rounded-[2rem] p-6">
  <div className="flex items-center gap-3 mb-5">
    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
      <Truck className="w-7 h-7 text-orange-500" />
    </div>

    <div>
      <p className="text-xs font-black uppercase tracking-widest text-orange-500">
        Delivery Information
      </p>

      <h2 className="text-2xl font-black text-gray-950">
        Estimated Delivery Time
      </h2>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
      <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">
        Delivery Time
      </p>

      <h3 className="text-3xl font-black text-gray-950">
        {order.estimatedDelivery || "3–5 Days"}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        Delivery depends on your location.
      </p>
    </div>

    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
      <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">
        Shipping Charge
      </p>

      <h3 className="text-3xl font-black text-gray-950">
        NPR {order.deliveryCharge || 0}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        Calculated automatically by distance.
      </p>
    </div>
  </div>
</div>
            <p className="text-xs text-gray-400 text-center">
              Invoice is available after payment is verified as Paid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}