import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMsg('');
    setErrorMsg('');

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:5000/api/contact', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
      });

      if (response.data.success) {
        setSuccessMsg(
          'Thank you for reaching out! PatraPatrika Center will get back to you soon.'
        );

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        });
      } else {
        setErrorMsg('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setErrorMsg(
        error.response?.data?.error ||
          'Failed to send message. Please make sure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>

            <p className="text-gray-600">
              Have a question about a book, magazine, or a stationery order?
              We'd love to hear from you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]">
                <Mail size={20} />
              </div>

              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-gray-500 text-sm">
                  support@PatraPatrikaCenter.com
                </p>
                <p className="text-gray-500 text-sm">
                  info@patrapatrikacentre.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]">
                <Phone size={20} />
              </div>

              <div>
                <h4 className="font-bold">Call Us</h4>
                <p className="text-gray-500 text-sm">+977-1-4XXXXXX</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-[#6366F1]">
                <MapPin size={20} />
              </div>

              <div>
                <h4 className="font-bold">Visit Us</h4>
                <p className="text-gray-600 text-sm font-semibold">
                  PatraPatrika Center
                </p>
                <p className="text-gray-500 text-sm">Hetauda City, Nepal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                placeholder="How can we help you today?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#6366F1] hover:bg-[#4F46E5] cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;