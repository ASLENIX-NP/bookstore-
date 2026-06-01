import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            User Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Registered customer accounts
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
            Total Users
          </p>

          <p className="text-2xl font-black text-indigo-600">
            {users.length}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-500 font-semibold">
            Loading users...
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email Address
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-slate-50 transition"
                    >
                     <td className="px-6 py-4">
  <div className="flex items-center gap-3">
    <div
      className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm ${
        [
          "bg-orange-500",
          "bg-indigo-500",
          "bg-green-500",
          "bg-pink-500",
          "bg-purple-500",
          "bg-blue-500",
          "bg-red-500",
          "bg-teal-500",
        ][(user.name?.charCodeAt(0) || 0) % 8]
      }`}
    >
      {user.name?.charAt(0)?.toUpperCase() || "U"}
    </div>

    <div>
      <p className="font-semibold text-gray-900 text-base">
        {user.name}
      </p>
    </div>
  </div>
</td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
  <p className="font-semibold text-gray-900 truncate">
    {user.name}
  </p>

  <p className="text-sm text-gray-500 truncate">
    {user.email}
  </p>
</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}