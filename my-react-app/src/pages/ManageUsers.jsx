import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch users
  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  // Helper function to calculate if user is online
  const checkStatus = (lastSeen) => {
    if (!lastSeen) return false;
    const lastActive = new Date(lastSeen).getTime();
    const now = new Date().getTime();
    // 5 minute threshold (5 * 60 * 1000 milliseconds)
    return (now - lastActive) < (5 * 60 * 1000);
  };

  useEffect(() => {
    fetchUsers(); // Initial fetch
    
    // Refresh user list every 30 seconds so statuses stay live
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="bg-white px-6 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-600 font-medium">Total Users: </span>
          <span className="text-xl font-bold text-blue-600">{users.length}</span>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => {
                  const isOnline = checkStatus(user.lastSeen);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Indicator Dot */}
                          <span className={`relative flex h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}>
                            {isOnline && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            )}
                          </span>
                          <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}