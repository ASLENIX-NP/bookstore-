import React, { useEffect, useMemo, useState } from "react";
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
  ArrowUpRight,
  Activity,
  Boxes,
  CreditCard,
  ShieldCheck,
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
  CartesianGrid,
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

  const getOrderAmount = (order) => {
    return Number(order?.grandTotal || order?.totalPrice || 0);
  };

  const getOrderTimeLabel = (order, index) => {
    const date = order?.createdAt ? new Date(order.createdAt) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return `Order ${index + 1}`;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDateLabel = (value) => {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString();
  };

  const chartData = useMemo(() => {
    const orders = Array.isArray(recentOrders) ? recentOrders : [];

    return orders
      .slice()
      .reverse()
      .map((order, index) => ({
        orderId: order?._id?.substring(0, 8) || `Order ${index + 1}`,
        label: getOrderTimeLabel(order, index),
        date: getDateLabel(order?.createdAt),
        revenue: getOrderAmount(order),
        orders: 1,
        customer: order?.customerName || "Guest Customer",
      }));
  }, [recentOrders]);

  const dashboardHealth = useMemo(() => {
    const totalOrders = Number(stats.totalOrders || 0);
    const paidOrders = Number(stats.paidOrders || 0);
    const pendingPayments = Number(stats.pendingPayments || 0);
    const cancelledOrders = Number(stats.cancelledOrders || 0);

    const paidRate =
      totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0;

    const pendingRate =
      totalOrders > 0 ? Math.round((pendingPayments / totalOrders) * 100) : 0;

    const cancelledRate =
      totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

    return {
      paidRate,
      pendingRate,
      cancelledRate,
    };
  }, [stats]);

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
      icon: DollarSign,
      color: "from-emerald-500 to-green-600",
      softColor: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Today's Revenue",
      value: `NPR ${formatMoney(stats.todayRevenue)}`,
      subtitle: `${stats.todayOrders || 0} paid order(s) today`,
      icon: TrendingUp,
      color: "from-orange-500 to-amber-500",
      softColor: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      subtitle: "All customer orders",
      icon: ShoppingCart,
      color: "from-indigo-500 to-blue-600",
      softColor: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Paid Orders",
      value: stats.paidOrders || 0,
      subtitle: `${dashboardHealth.paidRate}% payment completion`,
      icon: CheckCircle2,
      color: "from-sky-500 to-cyan-600",
      softColor: "bg-sky-50 text-sky-600",
    },
  ];

  const secondaryCards = [
    {
      title: "Pending Payments",
      value: stats.pendingPayments || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Processing Orders",
      value: stats.processingOrders || 0,
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Confirmed Orders",
      value: stats.confirmedOrders || 0,
      icon: CheckCircle2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Cancelled Orders",
      value: stats.cancelledOrders || 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Products",
      value: stats.totalProducts || 0,
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockProducts || 0,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Users",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload || {};

    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {data.date}
        </p>

        <p className="text-sm font-black text-slate-950 mt-1">
          {data.customer || label}
        </p>

        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-xs font-bold mt-1">
            <span className="text-slate-500">
              {entry.dataKey === "revenue" ? "Revenue" : "Orders"}:
            </span>{" "}
            <span className="text-slate-950">
              {entry.dataKey === "revenue"
                ? `NPR ${formatMoney(entry.value)}`
                : `${Number(entry.value || 0)} order(s)`}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-8 shadow-xl shadow-slate-200">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <BarChart3 className="w-4 h-4" />
              Admin Dashboard
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Real Store Statistics
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Revenue, orders, payments, inventory, users, messages, and product
              performance from MongoDB.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardStats}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 disabled:bg-white/70 text-slate-950 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {mainCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`absolute -top-14 -right-14 w-32 h-32 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-all`}
                  />

                  <div className="relative flex items-start justify-between gap-4">
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
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.softColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Revenue Trend
                    </h2>

                    <p className="text-xs text-slate-400 font-bold mt-1">
                      Recent order value movement
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                    No revenue chart data found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Orders Overview
                    </h2>

                    <p className="text-xs text-slate-400 font-bold mt-1">
                      One bar per recent order
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-sm font-bold text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                    No order chart data found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="orders"
                        fill="#4f46e5"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-green-600">
                    Estimated Profit
                  </p>

                  <h2 className="text-3xl font-black text-green-950 mt-2">
                    NPR {(Number(stats.totalRevenue || 0) * 0.35).toFixed(0)}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white text-green-600 flex items-center justify-center shadow-sm">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>

              <p className="text-sm text-green-700 mt-4">
                Profit estimate is currently calculated as 35% of total revenue.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-black text-green-800 mb-2">
                    <span>Paid Rate</span>
                    <span>{dashboardHealth.paidRate}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${dashboardHealth.paidRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-orange-800 mb-2">
                    <span>Pending Payment</span>
                    <span>{dashboardHealth.pendingRate}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${dashboardHealth.pendingRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black text-red-800 mb-2">
                    <span>Cancelled</span>
                    <span>{dashboardHealth.cancelledRate}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${dashboardHealth.cancelledRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {secondaryCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {card.title}
                  </p>

                  <h3 className="text-2xl font-black text-gray-950 mt-1">
                    {card.value}
                  </h3>
                </div>
              );
            })}
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

                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
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
                        className="border border-gray-100 bg-slate-50 hover:bg-white hover:shadow-sm rounded-2xl p-4 transition-all"
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
                              NPR{" "}
                              {formatMoney(order.grandTotal || order.totalPrice)}
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
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Top Selling Products
                  </h2>

                  <p className="text-sm text-gray-500">
                    Based on paid orders only.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>

              {topProducts.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm font-bold">
                  No paid product sales yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product._id?.productId || index}
                      className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-gray-100 rounded-2xl p-3 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
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