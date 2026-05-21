import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PackageCheck,
  Truck,
  CreditCard,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  AlertCircle,
  ReceiptText,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getLoggedUserEmail = () => {
    const directEmail =
      localStorage.getItem("email") || localStorage.getItem("userEmail");

    if (directEmail) return directEmail;

    const possibleUserKeys = ["user", "currentUser", "authUser"];

    for (const key of possibleUserKeys) {
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        const parsed = JSON.parse(value);
        if (parsed?.email) return parsed.email;
      } catch {
        // ignore
      }
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);

      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        if (parsed?.email) return parsed.email;
      } catch {
        // ignore
      }
    }

    return "";
  };

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first to view your orders.");
        navigate("/login", { state: { from: "/my-orders" } });
        return;
      }

      const email = getLoggedUserEmail();

      if (!email) {
        setError(
          "Could not find your login email in browser storage. Please logout and login again."
        );
        return;
      }

      setUserEmail(email);

      const response = await axios.get(
        `http://localhost:5000/api/orders/user/${encodeURIComponent(email)}`
      );

      setOrders(response.data || []);
    } catch (err) {
      console.error("My orders fetch error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load your orders. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getOrderStatus = (order) => {
    return order.orderStatus || order.status || "Processing";
  };

  const getPaymentStatus = (order) => {
    return order.paymentStatus || "Pending";
  };

  const getStatusStyle = (status) => {
    if (status === "Completed" || status === "Paid") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Confirmed") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    if (status === "Cancelled" || status === "Failed") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (status === "Verification Required") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = (status) => {
    if (status === "Completed" || status === "Paid") {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    if (status === "Cancelled" || status === "Failed") {
      return <XCircle className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
        <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <PackageCheck className="w-4 h-4" />
                My Orders
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-950">
                Track Your Orders
              </h1>

              <p className="text-gray-500 mt-2">
                View your order status, payment status, delivery details, and invoice.
              </p>

              {userEmail && (
                <p className="text-xs text-gray-400 mt-2">
                  Showing orders for:{" "}
                  <span className="font-black text-gray-600">{userEmail}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={fetchMyOrders}
              className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </section>

        {loading && (
          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-12 flex items-center justify-center">
            <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="ml-3 text-sm font-black text-gray-500">
              Loading your orders...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black">Unable to load orders</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] shadow-sm p-12 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />

            <h2 className="text-xl font-black text-gray-800">
              No orders yet
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              After you place an order, you can track it here.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl text-sm font-black"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const orderStatus = getOrderStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const isExpanded = expandedOrderId === order._id;
              const invoiceAllowed = paymentStatus === "Paid";

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      <div className="lg:col-span-3">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Order ID
                        </p>

                        <p className="font-mono text-sm text-orange-600 font-black mt-1">
                          #{order._id?.substring(0, 12)}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>

                      <div className="lg:col-span-3">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Products
                        </p>

                        <div className="mt-2 space-y-1">
                          {order.orderItems?.slice(0, 2).map((item, index) => (
                            <p
                              key={index}
                              className="text-sm font-bold text-gray-800"
                            >
                              {item.title}{" "}
                              <span className="text-gray-400">x{item.qty}</span>
                            </p>
                          ))}

                          {order.orderItems?.length > 2 && (
                            <p className="text-xs text-indigo-600 font-black">
                              +{order.orderItems.length - 2} more item(s)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Payment
                        </p>

                        <p className="text-sm font-black text-gray-900 mt-2 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          {order.paymentMethod || "Cash on Delivery"}
                        </p>

                        <span
                          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                            paymentStatus
                          )}`}
                        >
                          {getStatusIcon(paymentStatus)}
                          {paymentStatus}
                        </span>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Order Status
                        </p>

                        <span
                          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                            orderStatus
                          )}`}
                        >
                          {getStatusIcon(orderStatus)}
                          {orderStatus}
                        </span>

                        <p className="text-xl font-black text-gray-950 mt-3">
                          NPR {Number(order.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="lg:col-span-2 space-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId(isExpanded ? null : order._id)
                          }
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-xs font-black"
                        >
                          {isExpanded ? (
                            <>
                              Hide Details
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              View Details
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {invoiceAllowed ? (
                          <Link
                            to={`/invoice/${order._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl text-xs font-black"
                          >
                            <ReceiptText className="w-4 h-4" />
                            View Invoice
                          </Link>
                        ) : (
                          <div className="w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-black">
                            <Lock className="w-4 h-4" />
                            Invoice after payment
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-slate-50 p-5 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-black text-gray-950">
                              Delivery Address
                            </h3>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-black text-gray-900">
                                Label:
                              </span>{" "}
                              {order.deliveryInfo?.label || "Home"}
                            </p>

                            <p>
                              <span className="font-black text-gray-900">
                                Name:
                              </span>{" "}
                              {order.deliveryInfo?.fullName ||
                                order.customerName ||
                                "N/A"}
                            </p>

                            <p>
                              <span className="font-black text-gray-900">
                                Phone:
                              </span>{" "}
                              {order.deliveryInfo?.phone || order.phone || "N/A"}
                            </p>

                            <p>
                              <span className="font-black text-gray-900">
                                Address:
                              </span>{" "}
                              {order.deliveryInfo?.building},{" "}
                              {order.deliveryInfo?.area},{" "}
                              {order.deliveryInfo?.city},{" "}
                              {order.deliveryInfo?.region},{" "}
                              {order.deliveryInfo?.address}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <PackageCheck className="w-5 h-5 text-orange-600" />
                            <h3 className="font-black text-gray-950">
                              Ordered Products
                            </h3>
                          </div>

                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {order.orderItems?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-2xl p-3"
                              >
                                <img
                                  src={
                                    item.image ||
                                    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
                                  }
                                  alt={item.title}
                                  className="w-12 h-16 object-cover rounded-xl bg-white border border-gray-100"
                                />

                                <div className="flex-1">
                                  <p className="text-sm font-black text-gray-900">
                                    {item.title}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    Qty: {item.qty} | Rate: NPR{" "}
                                    {Number(item.price || 0).toLocaleString()}
                                  </p>

                                  <p className="text-xs font-black text-gray-800 mt-1">
                                    Amount: NPR{" "}
                                    {Number(item.subtotal || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-950 text-white rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Truck className="w-5 h-5 text-orange-300" />
                            <h3 className="font-black">VAT Summary</h3>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                Product Subtotal
                              </span>
                              <span className="font-black">
                                NPR{" "}
                                {Number(
                                  order.productSubtotal || 0
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                Delivery Charge
                              </span>
                              <span className="font-black">
                                NPR{" "}
                                {Number(
                                  order.deliveryCharge || 0
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                Taxable Amount
                              </span>
                              <span className="font-black">
                                NPR{" "}
                                {Number(
                                  order.taxableAmount || 0
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                VAT {Number(order.vatRate ?? 13)}%
                              </span>
                              <span className="font-black">
                                NPR{" "}
                                {Number(order.vatAmount || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="border-t border-white/10 pt-3 flex justify-between">
                              <span className="font-black">Grand Total</span>
                              <span className="text-2xl font-black">
                                NPR {Number(order.totalPrice || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 bg-white/10 border border-white/10 rounded-2xl p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Current Status
                            </p>

                            <p className="text-sm font-black mt-2">
                              Payment: {paymentStatus}
                            </p>

                            <p className="text-sm font-black mt-1">
                              Order: {orderStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}