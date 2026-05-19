import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // This fetches the messages from the API we added to server.js
    axios.get('http://localhost:5000/api/admin/messages')
      .then(res => setMessages(res.data))
      .catch(err => console.error("Error fetching messages:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Messages</h1>
      <div className="grid gap-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No new messages.</p>
        ) : (
          messages.map(msg => (
            <div key={msg._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg">{msg.firstName} {msg.lastName}</h3>
              <p className="text-sm text-gray-500">{msg.email}</p>
              <p className="mt-2 text-gray-700">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}