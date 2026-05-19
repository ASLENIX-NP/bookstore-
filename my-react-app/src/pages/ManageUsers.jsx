import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual user API endpoint
    axios.get('http://localhost:5000/api/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Registered Users List</h1>
      {loading ? <p>Loading users...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {users.length === 0 ? <p>No users found.</p> : (
            <ul className="divide-y">
              {users.map(user => (
                <li key={user._id} className="py-3 font-medium">{user.name} ({user.email})</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}