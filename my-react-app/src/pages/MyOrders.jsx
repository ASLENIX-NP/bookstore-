import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
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
  Receipt,
  Ban,
  Star,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ORDER_TABS = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "toShip",
    label: "To Ship",
  },
  {
    key: "toReceive",
    label: "To Receive",
  },
  {
    key: "toReview",
    label: "To Review",
  },
];

const TO_SHIP_STATUSES = ["Processing", "Confirmed", "Packaging"];
const TO_RECEIVE_STATUSES = ["Shipped", "Out for Delivery"];
const TO_REVIEW_STATUSES = [
  "Delivered",
  "Completed",
  "Cancelled",
  "Failed Delivery",
];

const REVIEW_ALLOWED_STATUSES = ["Delivered", "Completed"];

const TRACKING_STEPS = [
  "Processing",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Completed",
];

const getDisplayStatus = (status) => {
  return status === "Shipped" ? "With Courier" : status;
};

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
        // ignore invalid stored value
      }
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);

      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);

        if (parsed?.email) return parsed.email;
      } catch {
        // ignore non-json values
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
        toast.error("Please login first to view your orders.");
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
        `https://bookstore-f3if.onrender.com/api/orders/user/${encodeURIComponent(email)}`
      );

      setOrders(Array.isArray(response.data) ? response.data : []);
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

  const getOrderTotal = (order) => {
    return Number(order.grandTotal || order.totalPrice || 0);
  };

  const getStatusStyle = (status) => {
    if (status === "Completed" || status === "Delivered" || status === "Paid") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Confirmed") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    if (status === "Packaging") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    if (status === "Shipped" || status === "Out for Delivery") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }

    if (
      status === "Cancelled" ||
      status === "Failed" ||
      status === "Failed Delivery"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (status === "Verification Required") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusIcon = (status) => {
    if (status === "Completed" || status === "Delivered" || status === "Paid") {
      return <CheckCircle2 className="w-4 h-4" />;
    }

    if (
      status === "Cancelled" ||
      status === "Failed" ||
      status === "Failed Delivery"
    ) {
      return <XCircle className="w-4 h-4" />;
    }

    return <Clock className="w-4 h-4" />;
  };

  const getStepCompleted = (orderStatus, step) => {
    const currentIndex = TRACKING_STEPS.indexOf(orderStatus);
    const stepIndex = TRACKING_STEPS.indexOf(step);

    if (currentIndex === -1 || stepIndex === -1) return false;

    return currentIndex >= stepIndex;
  };

  const getTabOrders = () => {
    if (activeTab === "toShip") {
      return orders.filter((order) =>
        TO_SHIP_STATUSES.includes(getOrderStatus(order))
      );
    }

    if (activeTab === "toReceive") {
      return orders.filter((order) =>
        TO_RECEIVE_STATUSES.includes(getOrderStatus(order))
      );
    }

    if (activeTab === "toReview") {
      return orders.filter((order) =>
        TO_REVIEW_STATUSES.includes(getOrderStatus(order))
      );
    }

    return orders;
  };

  const getTabCount = (tabKey) => {
    if (tabKey === "toShip") {
      return orders.filter((order) =>
        TO_SHIP_STATUSES.includes(getOrderStatus(order))
      ).length;
    }

    if (tabKey === "toReceive") {
      return orders.filter((order) =>
        TO_RECEIVE_STATUSES.includes(getOrderStatus(order))
      ).length;
    }

    if (tabKey === "toReview") {
      return orders.filter((order) =>
        TO_REVIEW_STATUSES.includes(getOrderStatus(order))
      ).length;
    }

    return orders.length;
  };

  const canCancelOrder = (order) => {
    const orderStatus = getOrderStatus(order);
    const paymentStatus = getPaymentStatus(order);

    if (paymentStatus === "Paid") return false;

    return orderStatus === "Processing";
  };

  const getProductId = (item) => {
    return item?.productId?._id || item?.productId || item?._id || "";
  };

  const cancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "This order will be cancelled permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel it",
    });

    if (!result.isConfirmed) return;

    try {
      setCancellingId(orderId);

      const response = await axios.patch(
        `https://bookstore-f3if.onrender.com/api/orders/${orderId}/cancel`,
        {
          cancelReason: "Cancelled by customer",
        }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? response.data.order : order
          )
        );

        toast.success("Order cancelled successfully.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Unable to cancel this order. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const visibleOrders = getTabOrders();

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
                View order status, payment status, delivery details, invoice,
                and review products after delivery.
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

        {!loading && !error && orders.length > 0 && (
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ORDER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setExpandedOrderId(null);
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm font-black border transition-all ${
                    activeTab === tab.key
                      ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs ${
                      activeTab === tab.key
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {getTabCount(tab.key)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

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

            <h2 className="text-xl font-black text-gray-800">No orders yet</h2>

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

        {!loading &&
          !error &&
          orders.length > 0 &&
          visibleOrders.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] shadow-sm p-12 text-center">
              <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />

              <h2 className="text-xl font-black text-gray-800">
                No orders in this section
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Orders will appear here when their status matches this tab.
              </p>
            </div>
          )}

        {!loading && !error && visibleOrders.length > 0 && (
          <div className="space-y-5">
            {visibleOrders.map((order) => {
              const orderStatus = getOrderStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const isExpanded = expandedOrderId === order._id;
              const invoiceAllowed = paymentStatus === "Paid";
              const cancelAllowed = canCancelOrder(order);
              const orderItems = Array.isArray(order.orderItems)
                ? order.orderItems
                : [];

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
                          {orderItems.slice(0, 2).map((item, index) => (
                            <p
                              key={index}
                              className="text-sm font-bold text-gray-800"
                            >
                              {item.title}{" "}
                              <span className="text-gray-400">x{item.qty}</span>
                            </p>
                          ))}

                          {orderItems.length > 2 && (
                            <p className="text-xs text-indigo-600 font-black">
                              +{orderItems.length - 2} more item(s)
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
                          {getDisplayStatus(orderStatus)}
                        </span>

                        <p className="text-xl font-black text-gray-950 mt-3">
                          NPR {getOrderTotal(order).toLocaleString()}
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

                        {invoiceAllowed && (
                          <Link
                            to={`/invoice/${order._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl text-xs font-black"
                          >
                            <Receipt className="w-4 h-4" />
                            View Invoice
                          </Link>
                        )}

                        {!invoiceAllowed && (
                          <div className="w-full text-center bg-amber-50 text-amber-700 border border-amber-100 px-4 py-3 rounded-2xl text-xs font-black">
                            Invoice after payment
                          </div>
                        )}

                        {cancelAllowed && (
                          <button
                            type="button"
                            onClick={() => cancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black border ${
                              cancellingId === order._id
                                ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                                : "bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
                            }`}
                          >
                            <Ban className="w-4 h-4" />

                            {cancellingId === order._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
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
                              {order.deliveryInfo?.phone ||
                                order.phone ||
                                "N/A"}
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

                            {order.deliveryPartner?.company && (
                              <p>
                                <span className="font-black text-gray-900">
                                  Courier:
                                </span>{" "}
                                {order.deliveryPartner.company}
                              </p>
                            )}

                            {order.deliveryPartner?.trackingNumber && (
                              <p>
                                <span className="font-black text-gray-900">
                                  Tracking:
                                </span>{" "}
                                {order.deliveryPartner.trackingNumber}
                              </p>
                            )}

                            {order.cancelReason && (
                              <p className="text-red-600">
                                <span className="font-black">
                                  Cancellation:
                                </span>{" "}
                                {order.cancelReason}
                              </p>
                            )}
                          </div>

                          <div className="mt-5 border-t border-gray-100 pt-5">
                            <h4 className="font-black text-gray-950 mb-3">
                              Order Progress
                            </h4>

                            <div className="space-y-3">
                              {TRACKING_STEPS.map((step) => {
                                const completed = getStepCompleted(
                                  orderStatus,
                                  step
                                );

                                return (
                                  <div
                                    key={step}
                                    className="flex items-center gap-3"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        completed
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      {completed ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                      ) : (
                                        <Clock className="w-4 h-4" />
                                      )}
                                    </div>

                                    <p
                                      className={`text-sm font-black ${
                                        completed
                                          ? "text-gray-900"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {getDisplayStatus(step)}
                                    </p>
                                  </div>
                                );
                              })}

                              {(orderStatus === "Cancelled" ||
                                orderStatus === "Failed Delivery") && (
                                <div className="flex items-center gap-3 text-red-600 font-black text-sm">
                                  <XCircle className="w-5 h-5" />
                                  {getDisplayStatus(orderStatus)}
                                </div>
                              )}
                            </div>
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
                            {orderItems.map((item, index) => {
                              const productId = getProductId(item);

                              return (
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
                                      {Number(
                                        item.subtotal || 0
                                      ).toLocaleString()}
                                    </p>

                                    {REVIEW_ALLOWED_STATUSES.includes(orderStatus) &&
  productId && (
                                        <Link
                                          to={`/products/${productId}?reviewOrder=${order._id}`}
                                          className="mt-3 inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 px-3 py-2 rounded-xl text-xs font-black"
                                        >
                                          <Star className="w-4 h-4" />
                                          Review Product
                                        </Link>
                                      )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-slate-950 text-white rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Truck className="w-5 h-5 text-orange-300" />

                            <h3 className="font-black">Payment Summary</h3>
                          </div>

                          <div className="space-y-3 text-sm">
                            {(() => {
                              const productTotal = Number(
                                order.productSubtotal || 0
                              );

                              const productWithoutVat = productTotal / 1.13;

                              const vatOnly = productTotal - productWithoutVat;

                              const deliveryCharge = Number(
                                order.deliveryCharge || 0
                              );

                              const grandTotal =
                                Number(order.grandTotal || order.totalPrice) ||
                                productTotal + deliveryCharge;

                              return (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">
                                      Product Price Without VAT
                                    </span>

                                    <span className="font-black">
                                      NPR {productWithoutVat.toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-300">
                                      VAT 13%
                                    </span>

                                    <span className="font-black">
                                      NPR {vatOnly.toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-300">
                                      Product Total
                                    </span>

                                    <span className="font-black">
                                      NPR {productTotal.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-300">
                                      Delivery Charge
                                    </span>

                                    <span className="font-black">
                                      NPR {deliveryCharge.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="border-t border-white/10 pt-3 flex justify-between">
                                    <span className="font-black">
                                      Grand Total
                                    </span>

                                    <span className="text-2xl font-black">
                                      NPR {grandTotal.toLocaleString()}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          <div className="mt-5 bg-white/10 border border-white/10 rounded-2xl p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                              Current Status
                            </p>

                            <p className="text-sm font-black mt-2">
                              Payment: {paymentStatus}
                            </p>

                            <p className="text-sm font-black mt-1">
                              Order: {getDisplayStatus(orderStatus)}
                            </p>

                            <p className="text-sm font-black mt-1">
                              Estimated Delivery:{" "}
                              {order.estimatedDelivery || "3–5 Days"}
                            </p>
                          </div>

                          {activeTab === "toReview" && (
  <div className="mt-5 bg-amber-400/10 border border-amber-300/20 rounded-2xl p-4">
    <div className="flex items-start gap-3">
      <MessageSquare className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />

      <p className="text-sm text-amber-50 font-bold">
        {REVIEW_ALLOWED_STATUSES.includes(orderStatus)
          ? "Your order is delivered. You can now review the purchased products."
          : orderStatus === "Cancelled"
          ? "This order was cancelled."
          : orderStatus === "Failed Delivery"
          ? `Delivery failed.${order.deliveryFailureReason ? ` Reason: ${order.deliveryFailureReason}` : ""}`
          : "This order is closed."}
      </p>
    </div>
  </div>
)}
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