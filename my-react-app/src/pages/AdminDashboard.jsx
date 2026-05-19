import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboard() {
  // Metrics & Backend Live States
  const [totals, setTotals] = useState({ revenue: 0, itemsSold: 0, itemsAdded: 0 });
  const [stockAlerts, setStockAlerts] = useState([]);

  // Load telemetry report data directly from MongoDB logs loop
  useEffect(() => {
    // 1. Fetch dashboard quick-load telemetry KPIs
    axios.get('http://localhost:5000/api/admin/daily-report?timeframe=daily')
      .then(res => {
        if (res.data?.success) setTotals(res.data.metrics);
      })
      .catch(err => console.error("Error running dashboard quick-load telemetry:", err));

    // 2. Fetch full inventory listings to extract low stock status configurations
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        const outOfStockItems = res.data.filter(item => item.stockStatus === 'Out of Stock');
        setStockAlerts(outOfStockItems);
      })
      .catch(err => console.error("Error retrieving real stock alerts:", err));
  }, []);

  return (
    <div className="space-y-8">
      {/* SECTION HEADER PANEL */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Metrics Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time storefront management diagnostics and dynamic catalog indicators.</p>
      </div>

      {/* KPI BALANCE CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Revenue Ledger */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</p>
            <h3 className="text-2xl font-black text-gray-800">NPR {totals.revenue.toLocaleString()}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Units Dispatched */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Sales Volume</p>
            <h3 className="text-2xl font-black text-gray-800">{totals.itemsSold} Units</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-100 text-indigo-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Accessions Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Items Cataloged</p>
            <h3 className="text-2xl font-black text-gray-800">{totals.itemsAdded} Products</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-100 text-amber-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* LOWER VISUALIZATION GRID FRAME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Canvas Block */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-amber-500 w-5 h-5" /> Active Cloud Connections
          </h4>
          <p className="text-sm text-gray-500">Database synchronization pipelines initialized safely. Cross-origin validation loops operating within normal speed parameters.</p>
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm font-medium text-gray-400 bg-gray-50">
            [ Transaction Tracking Graph Visualization Canvas Area ]
          </div>
        </div>

        {/* Dynamic Alerts System Panel Block */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-500 w-5 h-5" /> Stock Alerts ({stockAlerts.length})
          </h4>
          
          {stockAlerts.length === 0 ? (
            <p className="text-xs font-medium text-gray-400 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center">
              All active platform items are currently well-stocked.
            </p>
          ) : (
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {stockAlerts.map(item => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 text-xs">
                  <span className="font-bold text-red-700 truncate max-w-[150px]">{item.title}</span>
                  <span className="font-semibold text-red-600 bg-white px-2 py-0.5 rounded-md border border-red-200 shrink-0">Out of Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}