import React, { useState, useEffect } from 'react';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) throw new Error('Failed to fetch order records');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle live interactive state toggling on status badges
  const handleToggleStatus = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Optimistically update the UI local state layout directly
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: order.status === 'Processing' ? 'Completed' : 'Processing' }
              : order
          )
        );
      }
    } catch (err) {
      alert('Error updating status pipeline: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Customer Orders Status</h1>
        <p className="text-gray-600 text-sm">Verify incoming checkouts and toggle status badges dynamically.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-500 font-medium">Loading orders data...</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
          ⚠️ <strong>Connection Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-medium">
              No transactions have been logged in the bookstore database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Book Title(s)</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status Flag (Click to Change)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 font-mono text-xs text-orange-600 font-semibold">
                        #{order._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{order.customerName || 'Guest'}</div>
                        <div className="text-xs text-gray-400">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-800">
                        {order.orderItems?.map((item) => `${item.title} (x${item.qty})`).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        NPR {order.totalPrice}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(order._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-transform active:scale-95 cursor-pointer
                            ${order.status === 'Completed'
                              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${order.status === 'Completed' ? 'bg-green-600' : 'bg-amber-500'}`}></span>
                          {order.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}