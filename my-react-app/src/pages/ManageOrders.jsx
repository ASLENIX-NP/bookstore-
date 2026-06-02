import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PackageCheck,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  ReceiptText,
} from "lucide-react";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch order records");
      }

      const data = await response.json();

      const ordersData = Array.isArray(data)
        ? data
        : data.orders || data.data || [];

      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const getOrderStatus = (order) => {
    return order?.orderStatus || order?.status || "Processing";
  };

  const getPaymentStatus = (order) => {
    return order?.paymentStatus || "Pending";
  };

  const getPaymentMethod = (order) => {
    return order?.paymentMethod || "Cash on Delivery";
  };

  const getOrderTotal = (order) => {
    return Number(order?.grandTotal || order?.totalPrice || 0);
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const data = await response.json();

      const updatedOrder = data.order || data.data || data;

      setOrders((prevOrders) => {
        const safePreviousOrders = Array.isArray(prevOrders) ? prevOrders : [];

        return safePreviousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        );
      });

      toast.success("Order status updated successfully.");
    } catch (err) {
      toast.error("Error updating order status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const data = await response.json();

      const updatedOrder = data.order || data.data || data;

      setOrders((prevOrders) => {
        const safePreviousOrders = Array.isArray(prevOrders) ? prevOrders : [];

        return safePreviousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        );
      });

      toast.success("Payment status updated successfully.");
    } catch (err) {
      toast.error("Error updating payment status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setOrders((prevOrders) => {
        const safePreviousOrders = Array.isArray(prevOrders) ? prevOrders : [];

        return safePreviousOrders.filter((order) => order._id !== orderId);
      });

      toast.success("Order deleted successfully.");
    } catch (err) {
      toast.error("Error deleting order: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setOrderStatusFilter("All");
    setPaymentStatusFilter("All");
    setPaymentMethodFilter("All");
  };

  const getOrderStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Confirmed") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }

    if (status === "Cancelled") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getPaymentStatusStyle = (status) => {
    if (status === "Paid") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Failed") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (status === "Verification Required") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getPaymentIcon = (status) => {
    if (status === "Paid") return <CheckCircle2 className="w-4 h-4" />;
    if (status === "Failed") return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getSearchableText = (order) => {
    const orderItems = Array.isArray(order?.orderItems) ? order.orderItems : [];

    const productText = orderItems
      .map((item) => `${item.title} ${item.qty} ${item.price}`)
      .join(" ");

    const deliveryText = [
      order?.deliveryInfo?.fullName,
      order?.deliveryInfo?.phone,
      order?.deliveryInfo?.region,
      order?.deliveryInfo?.city,
      order?.deliveryInfo?.building,
      order?.deliveryInfo?.area,
      order?.deliveryInfo?.address,
      order?.deliveryInfo?.label,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      order?._id,
      order?.customerName,
      order?.email,
      order?.phone,
      getPaymentMethod(order),
      getPaymentStatus(order),
      getOrderStatus(order),
      productText,
      deliveryText,
      getOrderTotal(order),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const filteredOrders = safeOrders.filter((order) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" || getSearchableText(order).includes(search);

    const matchesOrderStatus =
      orderStatusFilter === "All" ||
      getOrderStatus(order) === orderStatusFilter;

    const matchesPaymentStatus =
      paymentStatusFilter === "All" ||
      getPaymentStatus(order) === paymentStatusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "All" ||
      getPaymentMethod(order) === paymentMethodFilter;

    return (
      matchesSearch &&
      matchesOrderStatus &&
      matchesPaymentStatus &&
      matchesPaymentMethod
    );
  });

  const totalOrders = safeOrders.length;

  const pendingPayments = safeOrders.filter(
    (order) => getPaymentStatus(order) === "Pending"
  ).length;

  const paidOrders = safeOrders.filter(
    (order) => getPaymentStatus(order) === "Paid"
  ).length;

  const processingOrders = safeOrders.filter(
    (order) => getOrderStatus(order) === "Processing"
  ).length;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <PackageCheck className="w-4 h-4" />
            Admin Orders
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Customer Orders
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Search, filter, verify payment, manage order status, and open VAT
            invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Total Orders
            </p>

            <p className="text-3xl font-black text-gray-950 mt-2">
              {totalOrders}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Processing
            </p>

            <p className="text-3xl font-black text-amber-600 mt-2">
              {processingOrders}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Pending Payment
            </p>

            <p className="text-3xl font-black text-orange-600 mt-2">
              {pendingPayments}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Paid Orders
            </p>

            <p className="text-3xl font-black text-green-600 mt-2">
              {paidOrders}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />

            <h2 className="font-black text-gray-950">
              Search & Filter Orders
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search order ID, customer, email, phone, product, city..."
                className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Order Status</option>
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Verification Required">
                Verification Required
              </option>
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Khalti">Khalti</option>
              <option value="eSewa">eSewa</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-black text-gray-950">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-gray-950">
                {safeOrders.length}
              </span>{" "}
              orders
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-[2rem] shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />

          <span className="ml-3 text-gray-500 font-bold">
            Loading orders data...
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm">
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {!loading && !error && safeOrders.length === 0 && (
        <div className="p-12 text-center text-gray-400 text-sm font-bold bg-white border border-dashed border-gray-200 rounded-[2rem]">
          No orders have been placed yet.
        </div>
      )}

      {!loading &&
        !error &&
        safeOrders.length > 0 &&
        filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-bold bg-white border border-dashed border-gray-200 rounded-[2rem]">
            No orders match your current search/filter.
          </div>
        )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const orderStatus = getOrderStatus(order);
            const paymentStatus = getPaymentStatus(order);
            const paymentMethod = getPaymentMethod(order);
            const isExpanded = expandedOrderId === order._id;
            const orderItems = Array.isArray(order.orderItems)
              ? order.orderItems
              : [];

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                    <div className="xl:col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Order ID
                      </p>

                      <p className="font-mono text-sm text-orange-600 font-black mt-1">
                        #{order._id?.substring(0, 10)}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>

                    <div className="xl:col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Customer
                      </p>

                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2 font-black text-gray-950">
                          <User className="w-4 h-4 text-indigo-600" />
                          {order.customerName || "Guest Customer"}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {order.email || "N/A"}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {order.phone || order.deliveryInfo?.phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="xl:col-span-3">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Product Items
                      </p>

                      <div className="mt-2 space-y-1">
                        {orderItems.slice(0, 2).map((item, index) => (
                          <p
                            key={index}
                            className="text-sm font-bold text-gray-800 line-clamp-1"
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

                    <div className="xl:col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Payment
                      </p>

                      <div className="mt-2 space-y-2">
                        <p className="flex items-center gap-2 text-sm font-black text-gray-900">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          {paymentMethod}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getPaymentStatusStyle(
                            paymentStatus
                          )}`}
                        >
                          {getPaymentIcon(paymentStatus)}
                          {paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="xl:col-span-1">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Total
                      </p>

                      <p className="text-xl font-black text-gray-950 mt-2">
                        NPR {getOrderTotal(order).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        VAT: NPR{" "}
                        {Number(order.vatAmount || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="xl:col-span-2 flex flex-col gap-3">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-black border ${getOrderStatusStyle(
                          orderStatus
                        )}`}
                      >
                        {orderStatus}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order._id)
                        }
                        className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black"
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

                      <Link
                        to={`/invoice/${order._id}`}
                        className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black"
                      >
                        <ReceiptText className="w-4 h-4" />
                        Invoice
                      </Link>
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
                            Delivery Information
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
                              Full Name:
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
                              Region:
                            </span>{" "}
                            {order.deliveryInfo?.region || "N/A"}
                          </p>

                          <p>
                            <span className="font-black text-gray-900">
                              City:
                            </span>{" "}
                            {order.deliveryInfo?.city || "N/A"}
                          </p>

                          <p>
                            <span className="font-black text-gray-900">
                              Building:
                            </span>{" "}
                            {order.deliveryInfo?.building || "N/A"}
                          </p>

                          <p>
                            <span className="font-black text-gray-900">
                              Area:
                            </span>{" "}
                            {order.deliveryInfo?.area || "N/A"}
                          </p>

                          <p>
                            <span className="font-black text-gray-900">
                              Address:
                            </span>{" "}
                            {order.deliveryInfo?.address || "N/A"}
                          </p>

                          {order.deliveryDistanceKm !== undefined && (
                            <p>
                              <span className="font-black text-gray-900">
                                Distance:
                              </span>{" "}
                              {Number(order.deliveryDistanceKm || 0)} km
                            </p>
                          )}

                          {order.estimatedDelivery && (
                            <p>
                              <span className="font-black text-gray-900">
                                Estimated Delivery:
                              </span>{" "}
                              {order.estimatedDelivery}
                            </p>
                          )}
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

                      <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Truck className="w-5 h-5 text-indigo-600" />

                          <h3 className="font-black text-gray-950">
                            Admin Controls
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                              VAT Price Summary
                            </p>

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
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Product Price (Without VAT)
                                    </span>

                                    <span className="font-black">
                                      NPR {productWithoutVat.toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      VAT 13%
                                    </span>

                                    <span className="font-black">
                                      NPR {vatOnly.toFixed(2)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Product Total
                                    </span>

                                    <span className="font-black">
                                      NPR {productTotal.toLocaleString()}
                                    </span>
                                  </div>
                                  

                                  <div className="flex justify-between">
                                    <span className="text-gray-500">
                                      Delivery Charge
                                    </span>

                                    <span className="font-black">
                                      NPR {deliveryCharge.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="font-black text-gray-900">
                                      Grand Total
                                    </span>

                                    <span className="font-black text-gray-950 text-lg">
                                      NPR {grandTotal.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                              Payment Status
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                              {["Pending", "Paid", "Failed"].map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={updatingId === order._id}
                                  onClick={() =>
                                    updatePaymentStatus(order._id, status)
                                  }
                                  className={`px-3 py-2 rounded-xl text-xs font-black border ${
                                    paymentStatus === status
                                      ? getPaymentStatusStyle(status)
                                      : "bg-slate-50 text-gray-500 border-gray-100 hover:bg-slate-100"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                              Order Status
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                "Processing",
                                "Confirmed",
                                "Completed",
                                "Cancelled",
                              ].map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={updatingId === order._id}
                                  onClick={() =>
                                    updateOrderStatus(order._id, status)
                                  }
                                  className={`px-3 py-2 rounded-xl text-xs font-black border ${
                                    orderStatus === status
                                      ? getOrderStatusStyle(status)
                                      : "bg-slate-50 text-gray-500 border-gray-100 hover:bg-slate-100"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          <Link
                            to={`/invoice/${order._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl text-sm font-black"
                          >
                            <ReceiptText className="w-4 h-4" />
                            Open VAT Invoice
                          </Link>

                          <button
                            type="button"
                            disabled={updatingId === order._id}
                            onClick={() => deleteOrder(order._id)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-3 rounded-2xl text-sm font-black"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Order
                          </button>
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
  );
}