import React, { useEffect, useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Car,
  CalendarDays,
  Store,
  ArrowRight,
} from "lucide-react";

const defaultStoreInfo = {
  storeName: "PatraPatrika Center",
  address: "Parijat Marg, Hetauda, Nepal",
  phone: "+9779865436980",
  weekdaysHours: "6:00 AM - 9:00 PM",
  saturdayHours: "6:00 AM - 11:00 AM",
  sundayHours: "Closed",
};

const Location = () => {
  const [heroData, setHeroData] = useState({
    backgroundImage: "",
    sliderImages: [],
  });

  const [storeInfo, setStoreInfo] = useState(defaultStoreInfo);

  useEffect(() => {
    const savedStore = localStorage.getItem("storeInfo");

    if (savedStore) {
      try {
        const parsedStore = JSON.parse(savedStore);

        setStoreInfo({
          ...defaultStoreInfo,
          ...parsedStore,
        });
      } catch (error) {
        console.error("Store info parse error:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        let response = await fetch("https://bookstore-f3if.onrender.com/api/admin/hero");

        if (!response.ok) {
          response = await fetch("https://bookstore-f3if.onrender.com/api/hero");
        }

        if (!response.ok) {
          throw new Error("Hero background not found");
        }

        const data = await response.json();

        setHeroData({
          backgroundImage: data?.backgroundImage || "",
          sliderImages: Array.isArray(data?.sliderImages)
            ? data.sliderImages
            : [],
        });
      } catch (error) {
        console.error("Hero background fetch error:", error);
      }
    };

    fetchHero();
  }, []);

  const heroBackgroundImage =
    heroData.backgroundImage || heroData.sliderImages?.[0] || "";

  const heroBackgroundStyle = heroBackgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.90), rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.72)), url("${heroBackgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 animate-in fade-in duration-500">
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={heroBackgroundStyle}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.25),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-bold text-indigo-100 mb-6">
              <MapPin className="w-4 h-4 text-orange-300" />
              Visit Our Store
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Find Patrapatrika Centre in Hetauda City.
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mt-5 leading-relaxed">
              Visit our main store for books, magazines, notebooks, files, and
              stationery items.
            </p>
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Store className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    Main Store
                  </p>

                  <h2 className="text-2xl font-black text-gray-950">
                    {storeInfo.storeName}
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-indigo-600 shadow-sm">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Address</h4>

                    <p className="text-gray-600 text-sm mt-1">
                      {storeInfo.address}
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-orange-50 hover:border-orange-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-orange-600 shadow-sm">
                    <Clock size={22} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Store Hours</h4>

                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600 text-sm">
                        <span className="font-bold">Mon - Fri:</span>{" "}
                        {storeInfo.weekdaysHours}
                      </p>

                      <p className="text-gray-600 text-sm">
                        <span className="font-bold">Sat:</span>{" "}
                        {storeInfo.saturdayHours}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                  <div className="bg-white p-3 rounded-xl text-emerald-600 shadow-sm">
                    <Phone size={22} />
                  </div>

                  <div>
                    <h4 className="font-black text-gray-950">Phone</h4>

                    <p className="text-gray-600 text-sm mt-1">
                      {storeInfo.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative">
                <Car className="w-9 h-9 text-indigo-100 mb-4" />

                <h3 className="text-2xl font-black mb-2">
                  Planning a visit?
                </h3>

                <p className="text-indigo-100 text-sm leading-relaxed">
                  We offer free parking for customers. Visit us for books,
                  magazines, notebooks, files, and stationery supplies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <CalendarDays className="w-6 h-6 text-indigo-600 mb-3" />

                <h4 className="font-black text-gray-950">Open Weekly</h4>

                <p className="text-sm text-gray-500 mt-1">
                  Available throughout the week.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <Navigation className="w-6 h-6 text-orange-600 mb-3" />

                <h4 className="font-black text-gray-950">Easy Access</h4>

                <p className="text-sm text-gray-500 mt-1">
                  Located around Parijat Marg.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-4 h-full">
              <div className="h-[420px] lg:h-full min-h-[520px] rounded-[1.5rem] overflow-hidden border border-gray-200 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.157929424843!2d85.03176717546366!3d27.428914638706348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb49e29f8601ad%3A0xb35e3962b322a36d!2sParijat%20Marg%2C%20Hetauda%2044107!5e0!3m2!1sen!2snp!4v1716200000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Patrapatrika Centre Location - Parijat Marg"
                />

                <div className="absolute left-4 right-4 bottom-4 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xl hidden sm:flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                      Store Location
                    </p>

                    <h4 className="font-black text-gray-950">
                      {storeInfo.address}
                    </h4>

                    <p className="text-sm text-gray-500">
                      Open for books and stationery customers.
                    </p>
                  </div>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Parijat%20Marg%2C%20Hetauda%2044107"
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-black transition-colors"
                  >
                    Open Map
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Location;