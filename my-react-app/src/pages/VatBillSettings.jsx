import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ReceiptText,
  Save,
  RefreshCw,
  AlertCircle,
  Building2,
  Percent,
  FileText,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  sellerName: "PatraPatrika Center",
  sellerVatPan: "000000",
  sellerAddress: "000000",
  sellerPhone: "000000",
  sellerEmail: "000000",
  sellerWebsite: "",
  invoiceTitle: "TAX INVOICE",
  invoicePrefix: "VAT",
  vatRate: 13,
  defaultBuyerVatPan: "000000",
  invoiceNote: "",
  declaration: "",
  footerText: "",
};

export default function VatBillSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const adminToken = localStorage.getItem("adminToken") || "";

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/admin/invoice-settings",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "x-admin-token": adminToken,
          },
        }
      );

      const settingsData =
        response.data?.settings || response.data?.data || response.data;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(settingsData || {}),
      });
    } catch (err) {
      console.error("VAT bill settings fetch error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to load VAT bill settings. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...settings,
        vatRate: Number(settings.vatRate || 0),
      };

      const response = await axios.put(
        "http://localhost:5000/api/admin/invoice-settings",
        payload,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "x-admin-token": adminToken,
          },
        }
      );

      const updatedSettings =
        response.data?.settings || response.data?.data || response.data;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(updatedSettings || payload),
      });

      toast.success("VAT bill settings updated successfully");
    } catch (err) {
      console.error("VAT bill settings save error:", err);

      toast.error(
        err.response?.data?.error ||
          "Failed to save VAT bill settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400";

  const labelClass =
    "block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            <ReceiptText className="w-4 h-4" />
            VAT Bill Settings
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Invoice & VAT Details
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Change seller details, VAT/PAN number, VAT rate, invoice prefix,
            and invoice notes shown on generated bills.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-100 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl text-sm font-black transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-12 flex items-center justify-center shadow-sm">
          <div className="w-9 h-9 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
          <p className="ml-3 text-sm font-black text-gray-500">
            Loading VAT bill settings...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-6 flex gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />

          <div>
            <h3 className="font-black">Settings Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Seller Information
                </h2>
                <p className="text-sm text-gray-500">
                  These details appear at the top of every invoice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Business / Shop Name</label>
                <input
                  type="text"
                  value={settings.sellerName}
                  onChange={(e) =>
                    handleChange("sellerName", e.target.value)
                  }
                  className={inputClass}
                  placeholder="PatraPatrika Center"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>VAT / PAN Number</label>
                <input
                  type="text"
                  value={settings.sellerVatPan}
                  onChange={(e) =>
                    handleChange("sellerVatPan", e.target.value)
                  }
                  className={inputClass}
                  placeholder="VAT/PAN number"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  type="text"
                  value={settings.sellerPhone}
                  onChange={(e) =>
                    handleChange("sellerPhone", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Phone number"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={settings.sellerEmail}
                  onChange={(e) =>
                    handleChange("sellerEmail", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Email address"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="text"
                  value={settings.sellerWebsite}
                  onChange={(e) =>
                    handleChange("sellerWebsite", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Website URL"
                />
              </div>

              <div>
                <label className={labelClass}>Default Buyer VAT/PAN</label>
                <input
                  type="text"
                  value={settings.defaultBuyerVatPan}
                  onChange={(e) =>
                    handleChange("defaultBuyerVatPan", e.target.value)
                  }
                  className={inputClass}
                  placeholder="000000"
                />
              </div>

              <div className="lg:col-span-2">
                <label className={labelClass}>Business Address</label>
                <input
                  type="text"
                  value={settings.sellerAddress}
                  onChange={(e) =>
                    handleChange("sellerAddress", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Business address"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Invoice & Tax Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Control invoice title, invoice number prefix, and VAT rate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Invoice Title</label>
                <input
                  type="text"
                  value={settings.invoiceTitle}
                  onChange={(e) =>
                    handleChange("invoiceTitle", e.target.value)
                  }
                  className={inputClass}
                  placeholder="TAX INVOICE"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) =>
                    handleChange("invoicePrefix", e.target.value)
                  }
                  className={inputClass}
                  placeholder="VAT"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>VAT Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.vatRate}
                  onChange={(e) => handleChange("vatRate", e.target.value)}
                  className={inputClass}
                  placeholder="13"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Invoice Notes
                </h2>
                <p className="text-sm text-gray-500">
                  Optional notes shown at the bottom of the invoice.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Invoice Note</label>
                <textarea
                  value={settings.invoiceNote}
                  onChange={(e) =>
                    handleChange("invoiceNote", e.target.value)
                  }
                  className={`${inputClass} min-h-[90px]`}
                  placeholder="Example: Goods once sold will not be returned."
                />
              </div>

              <div>
                <label className={labelClass}>Declaration</label>
                <textarea
                  value={settings.declaration}
                  onChange={(e) =>
                    handleChange("declaration", e.target.value)
                  }
                  className={`${inputClass} min-h-[90px]`}
                  placeholder="Example: We declare that this invoice shows the actual price of the goods described."
                />
              </div>

              <div>
                <label className={labelClass}>Footer Text</label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) =>
                    handleChange("footerText", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Thank you for shopping with us."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-orange-600 disabled:bg-slate-400 text-white px-7 py-4 rounded-2xl text-sm font-black transition-all"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save VAT Bill Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}