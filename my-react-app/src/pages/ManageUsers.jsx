import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching your user data
  useEffect(() => {
    axios.get('http://localhost:5000/api/users')
      .then(res => {
        // Assuming your backend returns a list of users
        // We initialize them with an 'isOnline' status (or fetched from backend)
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header and Total Count */}
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
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      {/* Live Status Indicator */}
                      <div className="flex items-center gap-2">
                        <span className={`relative flex h-3 w-3 ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-transparent'} opacity-75`}></span>
                        </span>
                        <span className={`text-sm font-medium ${user.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}