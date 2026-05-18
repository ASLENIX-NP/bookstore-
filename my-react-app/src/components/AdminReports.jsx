import React, { useState } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, CheckCircle, AlertCircle, FileText, Download, Calendar } from 'lucide-react';

export default function AdminReports() {
  const [timeframe, setTimeframe] = useState('daily');

  // Simulated live reporting data points for operational ownership metrics
  const reportsData = {
    daily: {
      revenue: "NPR 14,250",
      orders: 28,
      itemsSold: 42,
      pendingDispatches: 3,
      topCategory: "Stationery",
      recentSales: [
        { id: "TXN-901", items: "Muna Madan + Journal", total: "NPR 1,250", status: "Completed" },
        { id: "TXN-902", items: "Atomic Habits", total: "NPR 850", status: "Processing" },
        { id: "TXN-903", items: "Premium Blue Ink Pens (Pack of 10)", total: "NPR 450", status: "Completed" },
      ]
    },
    weekly: {
      revenue: "NPR 98,400",
      orders: 184,
      itemsSold: 291,
      pendingDispatches: 9,
      topCategory: "Books",
      recentSales: [
        { id: "TXN-844", items: "Bulk Notebook Order", total: "NPR 8,400", status: "Completed" },
        { id: "TXN-845", items: "Engineering Reference Manuals", total: "NPR 12,300", status: "Completed" },
      ]
    }
  };

  const activeReport = reportsData[timeframe];

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      
      {/* Report Control Strip Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-indigo-600 w-5 h-5" /> Executive Ownership Hub
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Track daily storefront margins, product flow velocities, and stock logs.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            <button 
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${timeframe === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Daily Report
            </button>
            <button 
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${timeframe === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Weekly Summary
            </button>
          </div>

          <button 
            onClick={() => alert('Exporting report metrics to CSV structure...')}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-auto cursor-pointer"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Grid Summary Dashboard Metric Deck cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Gross Revenue</p>
            <h4 className="text-2xl font-black text-gray-900">{activeReport.revenue}</h4>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Invoices</p>
            <h4 className="text-2xl font-black text-gray-900">{activeReport.orders} orders</h4>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dispatched Inventory</p>
            <h4 className="text-2xl font-black text-gray-900">{activeReport.itemsSold} units</h4>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">High Velocity Sector</p>
            <h4 className="text-xl font-bold text-indigo-600 mt-1">{activeReport.topCategory}</h4>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Critical Status Alerts & Quick Records Look */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Ledger Table List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-800 tracking-tight">Recent Settlement Registry</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium bg-gray-50/50">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Items Manifest</th>
                  <th className="py-2.5 px-3">Payout</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeReport.recentSales.map((sale, idx) => (
                  <tr key={idx} className="border-b border-gray-50 text-gray-700 font-medium hover:bg-gray-50/40">
                    <td className="py-3 px-3 font-mono text-indigo-600">{sale.id}</td>
                    <td className="py-3 px-3 truncate max-w-[180px]">{sale.items}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{sale.total}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        sale.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Management Exception Tasks Module */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 tracking-tight">Pending Actions Pending Action</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-50/60 p-3 rounded-lg border border-red-100/50">
                <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">{activeReport.pendingDispatches} Shipping Queues Unfulfilled</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Package deliveries awaiting courier tracking reference numbers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-100/50">
                <Calendar className="text-amber-600 w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Stock Reorder Alert Thresholds</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Some items matching subcategories have dipping counts.</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert('Navigating to checkout management board module')}
            className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors mt-4 cursor-pointer"
          >
            Open Order Pipeline
          </button>
        </div>
      </div>

    </div>
  );
}