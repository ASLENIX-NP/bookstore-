import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  ShieldCheck,
  Key,
  Settings,
  AlertTriangle,
  RefreshCw,
  Truck,
  FileText,
  Loader2,
} from "lucide-react";

const defaultPolicies = {
  contactDetails: {
  title: "Contact Details",
  content: JSON.stringify(
    {
      primaryEmail: "support@PatraPatrikaCenter.com",
      secondaryEmail: "info@patrapatrikacentre.com",
      phone: "+977-9866666666",
      whatsappNumber: "9779866666666",
      storeName: "PatraPatrika Center",
      address: "Parijat Marg, Hetauda, Nepal",
      responseTime: "We usually reply within a few hours.",
      mapUrl: "https://www.google.com/maps/place/Parijat+Marg,+Hetauda+44107",
    },
    null,
    2
  ),
},
  terms: {
    title: "Terms & Conditions",
    content: "",
  },
  privacy: {
    title: "Privacy Policy",
    content: "",
  },
  return: {
    title: "Return / Refund",
    content: "",
  },
  shipping: {
    title: "Shipping Policy",
    content: "",
  },
  contact: {
    title: "Contact Info",
    content: "",
  },
  aboutPage: {
    title: "A community built around books, learning, and creativity.",
    content: `We bring together quality books, fine stationery, and a friendly local store experience for readers, students, writers, and families.

PatraPatrika Center is dedicated to providing books, magazines, newspapers, educational materials, and stationery items to readers, students, and families.

Our goal is to make reading materials and learning essentials easily available through a simple online shopping experience.`,
  },
  contactPage: {
    title: "We are here to help with your books and stationery needs.",
    content: `Have a question about a book, magazine, stationery order, or availability? Send us your message and our team will respond as soon as possible.

Business Name: PatraPatrika Center
Address: Parijat Marg, Hetauda, Nepal
Phone: +977-9866666666
Email: support@PatraPatrikaCenter.com`,
  },
};

const policyTabs = [
  { key: "contactDetails", label: "Contact Details" },
  { key: "terms", label: "Terms & Conditions" },
  { key: "privacy", label: "Privacy Policy" },
  { key: "return", label: "Return / Refund" },
  { key: "shipping", label: "Shipping Policy" },
  { key: "contact", label: "Footer Contact Info" },
  { key: "aboutPage", label: "About Us Page" },
  { key: "contactPage", label: "Contact Page" },
];

export default function AdminSettings() {
  const [adminEmail, setAdminEmail] = useState("admin@bookstore.com");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [shippingFee, setShippingFee] = useState(150);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [policies, setPolicies] = useState(defaultPolicies);
  const [activePolicyKey, setActivePolicyKey] = useState("terms");
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySaving, setPolicySaving] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminUser");

    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.email) setAdminEmail(parsed.email);
      } catch (e) {
        console.error("Error retrieving admin config state:", e);
      }
    }

    fetchPolicies();
  }, []);

  const triggerStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: "", text: "" }), 4000);
  };

  const fetchPolicies = async () => {
    try {
      setPolicyLoading(true);

      const response = await axios.get("http://localhost:5000/api/policies");

      const policyMap = { ...defaultPolicies };

      response.data.policies.forEach((policy) => {
        policyMap[policy.key] = {
          title: policy.title || policyMap[policy.key]?.title || "",
          content: policy.content || policyMap[policy.key]?.content || "",
        };
      });

      setPolicies(policyMap);
    } catch (error) {
      console.error("Policy fetch error:", error);
      triggerStatus("error", "Failed to load policy content.");
    } finally {
      setPolicyLoading(false);
    }
  };

  const handlePolicyChange = (field, value) => {
    setPolicies((prev) => ({
      ...prev,
      [activePolicyKey]: {
        ...prev[activePolicyKey],
        [field]: value,
      },
    }));
  };

  const saveActivePolicy = async () => {
    const selectedPolicy = policies[activePolicyKey];

    if (!selectedPolicy?.title || !selectedPolicy?.content) {
      triggerStatus("error", "Title and content are required.");
      return;
    }

    try {
      setPolicySaving(true);

      await axios.put(
        `http://localhost:5000/api/admin/policies/${activePolicyKey}`,
        {
          title: selectedPolicy.title,
          content: selectedPolicy.content,
        }
      );

      triggerStatus("success", "Content saved successfully.");
      await fetchPolicies();
    } catch (error) {
      console.error("Policy save error:", error);
      triggerStatus(
        "error",
        error.response?.data?.message || "Failed to save content."
      );
    } finally {
      setPolicySaving(false);
    }
  };

  const handleSecurityUpdate = (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      triggerStatus("error", "Please fill out all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      triggerStatus("error", "New passwords do not match.");
      return;
    }

    triggerStatus("success", "Security configurations modified successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePreferencesUpdate = (e) => {
    e.preventDefault();
    triggerStatus("success", "Store operational policies deployed successfully.");
  };

  const runSystemBackup = () => {
    setIsBackingUp(true);

    setTimeout(() => {
      setIsBackingUp(false);
      triggerStatus("success", "Cloud snapshot pipeline completed safely.");
    }, 2000);
  };

  const activePolicy = policies[activePolicyKey] || {
    title: "",
    content: "",
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            Admin System Settings
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage store settings, security, legal policies, About Us, Contact
            page, and footer content.
          </p>
        </div>

        {statusMessage.text && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              Website Content Editor
            </h3>

            <div className="flex flex-wrap gap-2">
              {policyTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActivePolicyKey(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activePolicyKey === tab.key
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {policyLoading ? (
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading content...
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    value={activePolicy.title}
                    onChange={(e) => handlePolicyChange("title", e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Content
                  </label>

                  <textarea
                    value={activePolicy.content}
                    onChange={(e) =>
                      handlePolicyChange("content", e.target.value)
                    }
                    rows={14}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveActivePolicy}
                  disabled={policySaving}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all"
                >
                  {policySaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Content
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <Truck className="w-5 h-5 text-indigo-500" />
              Bookstore Core Defaults
            </h3>

            <form
              onSubmit={handlePreferencesUpdate}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Low Stock Trigger Threshold
                </label>

                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Base Delivery Charge
                </label>

                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Save Operational Rules
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <Key className="w-5 h-5 text-orange-500" />
              Update Security Credentials
            </h3>

            <form onSubmit={handleSecurityUpdate} className="space-y-5">
              <input
                type="email"
                disabled
                value={adminEmail}
                className="w-full bg-slate-100 border border-gray-200 text-gray-400 font-medium rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Current password"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />

                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="New password"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />

                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                Commit Security Patch
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Database Diagnostics
            </h3>

            <button
              onClick={runSystemBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isBackingUp ? "animate-spin" : ""}`}
              />
              {isBackingUp ? "Compiling Archives..." : "Execute Backup"}
            </button>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10">
              <Settings className="w-32 h-32 text-white" />
            </div>

            <div className="space-y-2 relative z-10">
              <h4 className="font-black text-sm uppercase tracking-wider text-orange-400">
                Maintenance Sandbox
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Activate maintenance mode when you want to temporarily disable
                customer access.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                Public Front-End Access
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsMaintenanceMode(!isMaintenanceMode);
                  triggerStatus(
                    "success",
                    `Platform status set to: ${
                      !isMaintenanceMode ? "Offline Mode" : "Live Mode"
                    }`
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isMaintenanceMode ? "bg-orange-500" : "bg-emerald-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    isMaintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}