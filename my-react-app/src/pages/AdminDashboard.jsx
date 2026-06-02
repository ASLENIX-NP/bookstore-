import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Truck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    pendingPayments: 0,
    failedPayments: 0,
    processingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    outOfStockProducts: 0,
    totalUsers: 0,
    unreadMessages: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalItemsSold: 0,
    todayItemsSold: 0,
    todayOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const revenueChartData = recentOrders.map((o) => ({
    date: new Date(o.createdAt).toLocaleDateString(),
    revenue: o.totalPrice || 0,
  }));
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard-stats"
      );

      if (response.data.success) {
        setStats(response.data.stats || {});
        setRecentOrders(response.data.recentOrders || []);
        setTopProducts(response.data.topProducts || []);
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);

      setError(
        err.response?.data?.error ||
          "Failed to load dashboard statistics. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const getPaymentStatusStyle = (status) => {
    if (status === "Paid") return "bg-green-50 text-green-700 border-green-200";
    if (status === "Failed") return "bg-red-50 text-red-700 border-red-200";
    if (status === "Verification Required") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
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

  const mainCards = [
    {
      title: "Total Revenue",
      value: `NPR ${formatMoney(stats.totalRevenue)}`,
      subtitle: "From paid orders",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Today's Revenue",
      value: `NPR ${formatMoney(stats.todayRevenue)}`,
      subtitle: `${stats.todayOrders || 0} paid order(s) today`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      subtitle: "All customer orders",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Paid Orders",
      value: stats.paidOrders || 0,
      subtitle: "Payment completed",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  const secondaryCards = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments || 0,
      icon: <Clock className="w-5 h-5" />,
      color: "text-amber-600",
    },
    {
      title: "Processing Orders",
      value: stats.processingOrders || 0,
      icon: <Truck className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      title: "Confirmed Orders",
      value: stats.confirmedOrders || 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-indigo-600",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      title: "Cancelled Orders",
      value: stats.cancelledOrders || 0,
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-600",
    },
    {
      title: "Products",
      value: stats.totalProducts || 0,
      icon: <Package className="w-5 h-5" />,
      color: "text-indigo-600",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockProducts || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-red-600",
    },
    {
      title: "Users",
      value: stats.totalUsers || 0,
      icon: <Users className="w-5 h-5" />,
      color: "text-slate-600",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: <Mail className="w-5 h-5" />,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <BarChart3 className="w-4 h-4" />
            Admin Dashboard
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Real Store Statistics
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Revenue, orders, users, inventory, and product performance from MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardStats}
          className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-12 flex items-center justify-center shadow-sm">
          <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="ml-3 text-sm font-black text-gray-500">
            Loading dashboard statistics...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-6">
          <h3 className="font-black">Dashboard Error</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            {mainCards.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                      {card.title}
                    </p>

                    <h2 className="text-2xl font-black text-gray-950 mt-2">
                      {card.value}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      {card.subtitle}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
{/* 📊 ERP CHART SECTION */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

  {/* REVENUE CHART */}
  <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
    <h2 className="text-lg font-black mb-4">
      📈 Revenue Trend
    </h2>


    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={revenueChartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* ORDERS CHART */}
  <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
    <h2 className="text-lg font-black mb-4">
      📦 Orders Overview
    </h2>

    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={revenueChartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#4f46e5" />
      </BarChart>
    </ResponsiveContainer>
  </div>

</div>
<div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
  <h2 className="font-black text-green-800">
    💰 Estimated Profit (ERP)
  </h2>

  <p className="text-sm text-green-700 mt-2">
    Profit = Revenue - Cost Price
  </p>

  <h3 className="text-2xl font-black mt-2 text-green-900">
    NPR {(stats.totalRevenue * 0.35).toFixed(0)}
  </h3>
</div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {secondaryCards.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className={`mb-3 ${card.color}`}>{card.icon}</div>

                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {card.title}
                </p>

                <h3 className="text-2xl font-black text-gray-950 mt-1">
                  {card.value}
                </h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Recent Orders
                  </h2>

                  <p className="text-sm text-gray-500">
                    Latest customer order activity.
                  </p>
                </div>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm font-bold">
                  No recent orders found.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const orderStatus =
                      order.orderStatus || order.status || "Processing";

                    return (
                      <div
                        key={order._id}
                        className="border border-gray-100 bg-slate-50 rounded-2xl p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                          <div className="md:col-span-2">
                            <p className="font-black text-gray-950 text-sm">
                              {order.customerName || "Guest Customer"}
                            </p>

                            <p className="font-mono text-xs text-orange-600 mt-1">
                              #{order._id?.substring(0, 10)}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : ""}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400 font-black uppercase">
                              Total
                            </p>

                            <p className="text-sm font-black text-gray-900">
                              NPR {formatMoney(order.totalPrice)}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${getPaymentStatusStyle(
                                order.paymentStatus || "Pending"
                              )}`}
                            >
                              {order.paymentStatus || "Pending"}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${getOrderStatusStyle(
                                orderStatus
                              )}`}
                            >
                              {orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6">
              <h2 className="text-xl font-black text-gray-950">
                Top Selling Products
              </h2>

              <p className="text-sm text-gray-500 mb-5">
                Based on paid orders only.
              </p>

              {topProducts.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm font-bold">
                  No paid product sales yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product._id?.productId || index}
                      className="flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-2xl p-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-950 truncate">
                          {product.title || "Product"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Sold:{" "}
                          <span className="font-black">
                            {product.quantitySold || 0}
                          </span>{" "}
                          | Revenue: NPR {formatMoney(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 bg-slate-950 text-white rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Total Items Sold
                </p>

                <p className="text-3xl font-black mt-2">
                  {stats.totalItemsSold || 0}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Today: {stats.todayItemsSold || 0} item(s)
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}