import React from 'react';
import { BookOpen, ShoppingCart, Users, DollarSign, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboard() {
  
  // Cleaned up color rendering format to avoid string-splitting runtime errors
  const statistics = [
    { label: 'Total Revenue', value: 'NPR 42,500', icon: DollarSign, bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { label: 'Books Active', value: '25 Products', icon: BookOpen, bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
    { label: 'Orders Processed', value: '148 Orders', icon: ShoppingCart, bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
    { label: 'Registered Clients', value: '1,240 Users', icon: Users, bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header View */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Metrics Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time store management diagnostic reports and catalog summaries.</p>
      </div>

      {/* Statistics Cards Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
              </div>
              {/* Clean, direct class application */}
              <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Log Tracking Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-amber-500 w-5 h-5" /> Recent Activity Stream
            </h4>
            <span className="text-xs bg-amber-50 px-2.5 py-1 text-amber-700 font-bold rounded-full">Live Logs</span>
          </div>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">System handshakes connected efficiently. Database transaction operations executing smoothly over connected clusters.</p>
            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm font-medium text-gray-400 bg-gray-50">
              [ Transaction Tracking Graph Visualization Canvas Area ]
            </div>
          </div>
        </div>

        {/* Right Column: Inventory Stock Status alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-indigo-500 w-5 h-5" /> Inventory Warnings
            </h4>
          </div>
          <ul className="space-y-3 pt-2">
            <li className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 text-xs">
              <span className="font-bold text-red-700">Atomic Habits</span>
              <span className="font-semibold text-red-600 bg-white px-2 py-0.5 rounded-md border border-red-200">Out of Stock</span>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs">
              <span className="font-bold text-orange-700">Apsara Erasers (Pack of 5)</span>
              <span className="font-semibold text-orange-600 bg-white px-2 py-0.5 rounded-md border border-orange-200">2 Items Left</span>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
              <span className="font-bold text-gray-700">Premium HB Pencils</span>
              <span className="font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">Optimal Stock</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}