import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Phone,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const defaultPolicies = {
  terms: {
    title: "Terms & Conditions",
    content:
      "Terms & Conditions content will appear here after admin updates it.",
  },
  privacy: {
    title: "Privacy Policy",
    content: "Privacy Policy content will appear here after admin updates it.",
  },
  return: {
    title: "Return / Refund Policy",
    content:
      "Return / Refund Policy content will appear here after admin updates it.",
  },
  shipping: {
    title: "Shipping Policy",
    content: "Shipping Policy content will appear here after admin updates it.",
  },
  contact: {
    title: "Contact Info",
    content: "Contact Info content will appear here after admin updates it.",
  },
};

const privacyTabs = [
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: ShieldCheck,
  },
  {
    key: "return",
    label: "Return / Refund Policy",
    icon: RefreshCcw,
  },
  {
    key: "shipping",
    label: "Shipping Policy",
    icon: Truck,
  },
  {
    key: "contact",
    label: "Contact Info",
    icon: Phone,
  },
];

export default function PolicyPage() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState(defaultPolicies);
  const [activeKey, setActiveKey] = useState(
    type === "terms" ? "terms" : "privacy"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type === "terms") {
      setActiveKey("terms");
    } else {
      setActiveKey("privacy");
    }
  }, [type]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);

        const response = await axios.get("http://localhost:5000/api/policies");

        const policyMap = { ...defaultPolicies };

        if (Array.isArray(response.data?.policies)) {
          response.data.policies.forEach((policy) => {
            if (policyMap[policy.key]) {
              policyMap[policy.key] = {
                title: policy.title || policyMap[policy.key].title,
                content: policy.content || policyMap[policy.key].content,
              };
            }
          });
        }

        setPolicies(policyMap);
      } catch (error) {
        console.error("Policy load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const activePolicy = policies[activeKey] || defaultPolicies[activeKey];
  const isTermsPage = type === "terms";

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-amber-400/10 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-black transition-all mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-amber-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-5">
            <FileText className="w-4 h-4" />
            Store Policy
          </div>

          <h1 className="text-3xl sm:text-5xl font-black">
            {isTermsPage ? "Terms" : "Privacy"}
          </h1>

          <p className="text-slate-300 mt-3 max-w-2xl">
            {isTermsPage
              ? "Read the Terms & Conditions for using PatraPatrika Center."
              : "View Privacy Policy, Return / Refund Policy, Shipping Policy, and Contact Info."}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="font-black text-slate-600">Loading policy...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {!isTermsPage && (
              <aside className="lg:col-span-1">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm space-y-2 sticky top-24">
                  {privacyTabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveKey(tab.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                          activeKey === tab.key
                            ? "bg-slate-950 text-white"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}

            <section
              className={isTermsPage ? "lg:col-span-4" : "lg:col-span-3"}
            >
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-10 shadow-xl">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
                  {activePolicy.title}
                </h2>

                <div className="mt-6 whitespace-pre-wrap text-slate-600 leading-relaxed text-sm sm:text-base">
                  {activePolicy.content}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}