import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import {
  Mail,
  Trash2,
  Eye,
  X,
  CheckCircle,
  Clock,
  RefreshCw,
  Reply,
} from 'lucide-react';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/messages');
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to fetch messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);

    if (!msg.isRead) {
      try {
        const res = await axios.patch(
          `http://localhost:5000/api/admin/messages/${msg._id}/read`,
          { isRead: true }
        );

        const updatedMessage = res.data.message;

        setMessages((prev) =>
          prev.map((item) =>
            item._id === updatedMessage._id ? updatedMessage : item
          )
        );

        setSelectedMessage(updatedMessage);
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleToggleRead = async (msg) => {
    try {
      const newReadValue = !msg.isRead;

      const res = await axios.patch(
        `http://localhost:5000/api/admin/messages/${msg._id}/read`,
        { isRead: newReadValue }
      );

      const updatedMessage = res.data.message;

      setMessages((prev) =>
        prev.map((item) =>
          item._id === updatedMessage._id ? updatedMessage : item
        )
      );

      if (selectedMessage?._id === updatedMessage._id) {
        setSelectedMessage(updatedMessage);
      }
    } catch (err) {
      console.error('Error updating read status:', err);
      toast.error('Failed to update message status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/messages/${id}`);

      setMessages((prev) => prev.filter((msg) => msg._id !== id));

      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message.');
    }
  };

  const handleReply = (msg) => {
    const subject = encodeURIComponent('Reply from PatraPatrika Center');
    const body = encodeURIComponent(
      `Hello ${msg.firstName},\n\nThank you for contacting PatraPatrika Center.\n\n`
    );

    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    return new Date(dateValue).toLocaleString();
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'read') return msg.isRead;
    if (filter === 'unread') return !msg.isRead;
    return true;
  });

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View, reply, mark as read, and delete customer queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              filter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All ({messages.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              filter === 'unread'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              filter === 'read'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Read
          </button>

          <button
            type="button"
            onClick={fetchMessages}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          Loading messages...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No messages found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-white border rounded-xl shadow-sm p-5 transition hover:shadow-md ${
                msg.isRead
                  ? 'border-gray-200'
                  : 'border-orange-200 bg-orange-50/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenMessage(msg)}
                  className="text-left flex-1 min-w-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {msg.firstName} {msg.lastName}
                    </h3>

                    {msg.isRead ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle size={12} />
                        Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        <Clock size={12} />
                        Unread
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">{msg.email}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(msg.createdAt)}
                  </p>

                  <p
                    className="mt-3 text-gray-700 leading-relaxed overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {msg.message}
                  </p>

                  <p className="text-sm text-indigo-600 font-semibold mt-2">
                    Click to read full message
                  </p>
                </button>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenMessage(msg)}
                    className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-semibold flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReply(msg)}
                    className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold flex items-center gap-2"
                  >
                    <Reply size={16} />
                    Reply
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg)}
                    className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-sm font-semibold flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(msg._id)}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Message from {selectedMessage.firstName}{' '}
                  {selectedMessage.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedMessage.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[55vh]">
              <p className="text-sm text-gray-400 mb-4">
                Received: {formatDate(selectedMessage.createdAt)}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {selectedMessage.message}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => handleReply(selectedMessage)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Mail size={16} />
                Reply by Email
              </button>

              <button
                type="button"
                onClick={() => handleToggleRead(selectedMessage)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedMessage._id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}