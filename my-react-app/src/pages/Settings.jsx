import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  Settings,
  FileText,
  Loader2,
  Building2,
  User,
  Calendar,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

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

  const [policies, setPolicies] = useState(defaultPolicies);
  const [activePolicyKey, setActivePolicyKey] = useState("terms");
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySaving, setPolicySaving] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    name: "System Admin",
    role: "Root Administrator",
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: "PatraPatrika Center",
    email: "support@patrapatrikacenter.com",
    phone: "+9779865436980",
    whatsapp: "9779865436980",
    address: "Parijat Marg, Hetauda, Nepal",
    weekdaysHours: "9:00 AM - 8:00 PM",
    saturdayHours: "10:00 AM - 6:00 PM",
  });
  const fetchPolicies = async () => {
    try {
      setPolicyLoading(true);

      const response = await axios.get("https://bookstore-f3if.onrender.com/api/policies");

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
      toast.error("Failed to load policy content.");
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminUser");

    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);

        if (parsed.email) {
          setAdminEmail(parsed.email);

          setAdminProfile((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
          }));
        }
      } catch (e) {
        console.error("Error retrieving admin config state:", e);
      }
    }

    fetchPolicies();
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem("adminProfile");

    if (savedProfile) {
      try {
        setAdminProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  useEffect(() => {
    const savedStore = localStorage.getItem("storeInfo");

    if (savedStore) {
      try {
        setStoreInfo(JSON.parse(savedStore));
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

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
      toast.error("Title and content are required.");
      return;
    }

    try {
      setPolicySaving(true);

      await axios.put(
        `https://bookstore-f3if.onrender.com/api/admin/policies/${activePolicyKey}`,
        {
          title: selectedPolicy.title,
          content: selectedPolicy.content,
        }
      );

      toast.success("Content saved successfully.");
      await fetchPolicies();
    } catch (error) {
      console.error("Policy save error:", error);

      toast.error(
        error.response?.data?.message || "Failed to save content."
      );
    } finally {
      setPolicySaving(false);
    }
  };

  const activePolicy = policies[activePolicyKey] || {
    title: "",
    content: "",
  };

  const saveAdminProfile = () => {
    localStorage.setItem("adminProfile", JSON.stringify(adminProfile));

    toast.success("Profile updated successfully.");
  };

  const saveStoreInfo = () => {
    localStorage.setItem("storeInfo", JSON.stringify(storeInfo));
    toast.success("Store information updated successfully!");
  }

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
                    onChange={(e) =>
                      handlePolicyChange("title", e.target.value)
                    }
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3 mb-6">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Store Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                value={storeInfo.storeName}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    storeName: e.target.value,
                  })
                }
                placeholder="Store Name"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />

              <input
                type="email"
                value={storeInfo.email}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    email: e.target.value,
                  })
                }
                placeholder="Store Email"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />

              <input
                type="text"
                value={storeInfo.phone}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone Number"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />

              <input
                type="text"
                value={storeInfo.whatsapp}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    whatsapp: e.target.value,
                  })
                }
                placeholder="WhatsApp Number"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />

              <input
                type="text"
                value={storeInfo.weekdaysHours}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    weekdaysHours: e.target.value,
                  })
                }
                placeholder="Mon - Fri Hours"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />

              <input
                type="text"
                value={storeInfo.saturdayHours}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    saturdayHours: e.target.value,
                  })
                }
                placeholder="Saturday Hours"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    address: e.target.value,
                  })
                }
                placeholder="Store Address"
                className="md:col-span-2 w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
              />
            </div>

            <button
              type="button"
              onClick={saveStoreInfo}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Save Store Information
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 border-b border-gray-50 pb-3 mb-6">
              <User className="w-5 h-5 text-indigo-500" />
              Admin Profile
            </h3>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                  {adminProfile.name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <button
                  type="button"
                  onClick={saveAdminProfile}
                  className="mt-4 px-5 py-3 border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50"
                >
                  Update Profile
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={adminProfile.name}
                  onChange={(e) =>
                    setAdminProfile({
                      ...adminProfile,
                      name: e.target.value,
                    })
                  }
                  className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
                />

                <input
                  type="email"
                  value={adminEmail}
                  readOnly
                  className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
                />

                <input
                  type="text"
                  value={adminProfile.role}
                  onChange={(e) =>
                    setAdminProfile({
                      ...adminProfile,
                      role: e.target.value,
                    })
                  }
                  className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
                />

                <input
                  type="text"
                  value="Active"
                  readOnly
                  className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-500" />

                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="font-semibold">Today</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />

                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold text-emerald-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}