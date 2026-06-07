import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  Send,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";

const DELIVERY_STATUSES = [
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Failed Delivery",
];

const getDisplayStatus = (status) => {
  return status === "Shipped" ? "With Courier" : status;
};

const getStatusStyle = (status) => {
  if (status === "Delivered") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (status === "Failed Delivery") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (status === "Out for Delivery" || status === "Shipped") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

const getStatusIcon = (status) => {
  if (status === "Delivered") {
    return <CheckCircle2 className="w-4 h-4" />;
  }

  if (status === "Failed Delivery") {
    return <XCircle className="w-4 h-4" />;
  }

  return <Clock className="w-4 h-4" />;
};

export default function DeliveryUpdate() {
  const { token } = useParams();

  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Shipped");
  const [note, setNote] = useState("");
  const [cashCollected, setCashCollected] = useState(false);
  const [cashCollectedAmount, setCashCollectedAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://bookstore-f3if.onrender.com/api/delivery-update/${token}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load delivery order.");
      }

      const orderData = data.order;

      setOrder(orderData);

      const currentStatus = orderData.orderStatus || orderData.status;

      setSelectedStatus(
        DELIVERY_STATUSES.includes(currentStatus) ? currentStatus : "Shipped"
      );

      setCashCollected(Boolean(orderData.cashCollected));

      setCashCollectedAmount(
        orderData.cashCollectedAmount
          ? String(orderData.cashCollectedAmount)
          : String(orderData.grandTotal || orderData.totalPrice || 0)
      );
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [token]);

  const getOrderTotal = () => {
    return Number(order?.grandTotal || order?.totalPrice || 0);
  };

  const isCashOnDelivery = () => {
    const method = String(order?.paymentMethod || "").toLowerCase();
    const gateway = String(order?.paymentGateway || "").toLowerCase();

    return (
      method.includes("cash") ||
      method.includes("cod") ||
      gateway.includes("cod")
    );
  };

  const getAddressText = () => {
    const info = order?.deliveryInfo || {};

    return [
      info.building,
      info.area,
      info.city,
      info.region,
      info.address,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      toast.error("Please select delivery status.");
      return;
    }

    if (selectedStatus === "Failed Delivery" && !note.trim()) {
      toast.error("Please write reason for failed delivery.");
      return;
    }

    if (cashCollected) {
      const amount = Number(cashCollectedAmount || 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Please enter valid cash collected amount.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `https://bookstore-f3if.onrender.com/api/delivery-update/${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: selectedStatus,
            note,
            cashCollected,
            cashCollectedAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update delivery status.");
      }

      const updatedOrder = data.order || data.data;

      setOrder(updatedOrder);
      setNote("");

      toast.success("Delivery status updated successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          <p className="font-black text-gray-600">Loading delivery order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-xl bg-red-50 border border-red-100 rounded-[2rem] p-8 shadow-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-7 h-7 shrink-0 mt-0.5" />

            <div>
              <h1 className="text-2xl font-black">Invalid Delivery Link</h1>

              <p className="text-sm mt-2">
                {error || "This delivery update link is invalid or expired."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderStatus = order.orderStatus || order.status || "Processing";
  const paymentStatus = order.paymentStatus || "Pending";
  const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-6">
        <section className="bg-slate-950 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Truck className="w-4 h-4" />
                Delivery Partner Access
              </div>

              <h1 className="text-3xl sm:text-4xl font-black">
                Update Delivery Status
              </h1>

              <p className="text-slate-300 mt-2">
                This page only updates delivery status for this order. It does
                not provide admin dashboard access.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Order ID
              </p>

              <p className="font-mono text-orange-300 font-black mt-1">
                #{order._id?.substring(0, 12)}
              </p>

              <span
                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border bg-white text-slate-800`}
              >
                {getStatusIcon(orderStatus)}
                {getDisplayStatus(orderStatus)}
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="font-black text-gray-950">
                  Customer & Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Customer
                  </p>

                  <p className="font-black text-gray-900 mt-2">
                    {order.deliveryInfo?.fullName ||
                      order.customerName ||
                      "Customer"}
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Phone
                  </p>

                  <p className="font-black text-gray-900 mt-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    {order.deliveryInfo?.phone || order.phone || "N/A"}
                  </p>
                </div>

                <div className="sm:col-span-2 bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Delivery Address
                  </p>

                  <p className="font-bold text-gray-800 mt-2 flex gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{getAddressText() || "Address not available"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h2 className="font-black text-gray-950">Order Items</h2>
              </div>

              <div className="space-y-3">
                {orderItems.map((item, index) => (
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
                      className="w-14 h-16 object-cover rounded-xl bg-white border border-gray-100"
                    />

                    <div className="flex-1">
                      <p className="font-black text-gray-900">{item.title}</p>

                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.qty} | Rate: NPR{" "}
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

            {Array.isArray(order.deliveryUpdateHistory) &&
              order.deliveryUpdateHistory.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-black text-gray-950">
                      Update History
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {[...order.deliveryUpdateHistory]
                      .reverse()
                      .map((history, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 border border-gray-100 rounded-2xl p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getStatusStyle(
                                history.status
                              )}`}
                            >
                              {getStatusIcon(history.status)}
                              {getDisplayStatus(history.status)}
                            </span>

                            <span className="text-xs text-gray-400 font-bold">
                              {history.createdAt
                                ? new Date(history.createdAt).toLocaleString()
                                : ""}
                            </span>
                          </div>

                          {history.note && (
                            <p className="text-sm text-gray-600 mt-2">
                              {history.note}
                            </p>
                          )}

                          {history.cashCollected && (
                            <p className="text-sm text-green-700 font-black mt-2">
                              Cash Collected: NPR{" "}
                              {Number(
                                history.cashCollectedAmount || 0
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </section>

          <aside className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="font-black text-gray-950">Payment Summary</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-black text-gray-900">
                    {order.paymentMethod || "Cash on Delivery"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="font-black text-gray-900">
                    {paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Product Total</span>
                  <span className="font-black text-gray-900">
                    NPR {Number(order.productSubtotal || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span className="font-black text-gray-900">
                    NPR {Number(order.deliveryCharge || 0).toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-black text-gray-950">Grand Total</span>
                  <span className="font-black text-gray-950 text-xl">
                    NPR {getOrderTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {isCashOnDelivery() && (
                <div className="mt-5 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />

                    <div>
                      <p className="text-sm font-black text-orange-700">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        Tick cash collected only after receiving payment from
                        customer. Admin will verify and mark payment as Paid.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <PackageCheck className="w-5 h-5 text-green-600" />
                <h2 className="font-black text-gray-950">
                  Update Delivery
                </h2>
              </div>

              <div className="space-y-3">
                {DELIVERY_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm font-black transition-all ${
                      selectedStatus === status
                        ? getStatusStyle(status)
                        : "bg-slate-50 text-gray-600 border-gray-100 hover:bg-slate-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {getStatusIcon(status)}
                      {getDisplayStatus(status)}
                    </span>

                    {selectedStatus === status && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Note
                </label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="4"
                  placeholder={
                    selectedStatus === "Failed Delivery"
                      ? "Write failed delivery reason..."
                      : "Optional delivery note..."
                  }
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {isCashOnDelivery() && (
                <div className="mt-5 bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <label className="flex items-center gap-2 text-sm font-black text-gray-800">
                    <input
                      type="checkbox"
                      checked={cashCollected}
                      onChange={(e) => setCashCollected(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Cash Collected
                  </label>

                  {cashCollected && (
                    <div className="mt-3">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Amount Collected
                      </label>

                      <input
                        type="number"
                        value={cashCollectedAmount}
                        onChange={(e) =>
                          setCashCollectedAmount(e.target.value)
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-3.5 rounded-2xl text-sm font-black"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Updating..." : "Update Status"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}