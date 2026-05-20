import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Headphones,
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.25),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-bold text-indigo-100 mb-6">
              <MessageCircle className="w-4 h-4 text-orange-300" />
              Contact PatraPatrika Center
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              We are here to help with your books and stationery needs.
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mt-5 leading-relaxed">
              Ask about academic books, magazines, stationery items, product
              availability, or store information. Your message will be sent
              directly to the admin panel.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Area */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Headphones className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    Support Desk
                  </p>
                  <h2 className="text-2xl font-black text-gray-950">
                    Get in Touch
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Have a question about a book, magazine, stationery order, or
                availability? Send us your message and our team will respond as
                soon as possible.
              </p>

              <div className="mt-8 space-y-4">
                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-indigo-600 shadow-sm">
                    <Mail size={20} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Email Us</h4>
                    <p className="text-gray-500 text-sm mt-1">
                      support@PatraPatrikaCenter.com
                    </p>
                    <p className="text-gray-500 text-sm">
                      info@patrapatrikacentre.com
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-orange-50 hover:border-orange-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-orange-600 shadow-sm">
                    <Phone size={20} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Call Us</h4>
                    <p className="text-gray-500 text-sm mt-1">
                      +977-1-4XXXXXX
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-emerald-600 shadow-sm">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Visit Us</h4>
                    <p className="text-gray-600 text-sm font-bold mt-1">
                      PatraPatrika Center
                    </p>
                    <p className="text-gray-500 text-sm">
                      Hetauda City, Nepal
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-violet-50 hover:border-violet-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-violet-600 shadow-sm">
                    <Clock size={20} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Response Time</h4>
                    <p className="text-gray-500 text-sm mt-1">
                      We usually reply as soon as possible after receiving your
                      message.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] shadow-xl p-6 sm:p-8 text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <Sparkles className="w-8 h-8 text-yellow-300 mb-4" />
                <h3 className="text-xl font-black">
                  Looking for a specific book or stationery item?
                </h3>
                <p className="text-indigo-100 text-sm leading-relaxed mt-3">
                  Send the title, author, grade level, or item name in your
                  message. This helps us check availability faster.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] shadow-xl border border-gray-100">
              <div className="mb-8">
                <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-3">
                  Send Message
                </p>

                <h2 className="text-3xl font-black text-gray-950">
                  Write your query
                </h2>

                <p className="text-gray-500 mt-2">
                  Fill the form below. Your message will appear inside the
                  admin message section.
                </p>
              </div>

              {successMsg && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 font-semibold transition-all"
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 font-semibold transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 font-semibold transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 font-semibold transition-all resize-none"
                    placeholder="Tell us what book, magazine, or stationery item you need..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 cursor-pointer shadow-indigo-100'
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

                <p className="text-xs text-gray-400 text-center">
                  Your message is stored securely in the admin message panel.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;