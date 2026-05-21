import React, { useEffect, useState } from "react";
import {
  Home,
  Building2,
  Plus,
  Edit3,
  MapPin,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const emptyAddress = {
  fullName: "",
  phone: "",
  region: "",
  city: "",
  building: "",
  area: "",
  address: "",
  label: "Home",
};

export default function CheckoutDelivery() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to continue checkout.");
      navigate("/login", { state: { from: "/checkout/delivery" } });
      return;
    }

    const checkoutItems = JSON.parse(
      localStorage.getItem("checkoutItems") || "[]"
    );

    if (!checkoutItems || checkoutItems.length === 0) {
      alert("Please select products before checkout.");
      navigate("/cart");
      return;
    }

    const savedAddresses = JSON.parse(
      localStorage.getItem("deliveryAddresses") || "[]"
    );

    setAddresses(savedAddresses);

    if (savedAddresses.length > 0) {
      setSelectedAddressId(savedAddresses[0].id);
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  }, [navigate]);

  const saveAddresses = (updatedAddresses) => {
    setAddresses(updatedAddresses);
    localStorage.setItem("deliveryAddresses", JSON.stringify(updatedAddresses));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.region.trim() ||
      !formData.city.trim() ||
      !formData.building.trim() ||
      !formData.area.trim() ||
      !formData.address.trim()
    ) {
      alert("Please fill in all delivery information.");
      return false;
    }

    return true;
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingAddressId) {
      const updatedAddresses = addresses.map((address) =>
        address.id === editingAddressId
          ? {
              ...address,
              ...formData,
            }
          : address
      );

      saveAddresses(updatedAddresses);
      setSelectedAddressId(editingAddressId);
      setEditingAddressId(null);
    } else {
      const newAddress = {
        id: Date.now().toString(),
        ...formData,
      };

      const updatedAddresses = [...addresses, newAddress];
      saveAddresses(updatedAddresses);
      setSelectedAddressId(newAddress.id);
    }

    setFormData(emptyAddress);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingAddressId(null);
    setFormData(emptyAddress);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddressId(address.id);
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      region: address.region || "",
      city: address.city || "",
      building: address.building || "",
      area: address.area || "",
      address: address.address || "",
      label: address.label || "Home",
    });
    setShowForm(true);
  };

  const proceedToPay = () => {
    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    if (!selectedAddress) {
      alert("Please select or add a delivery address.");
      return;
    }

    localStorage.setItem(
      "selectedDeliveryAddress",
      JSON.stringify(selectedAddress)
    );

    navigate("/checkout/payment");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-7">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <MapPin className="w-4 h-4" />
                Delivery Information
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-950">
                Choose Delivery Address
              </h1>

              <p className="text-gray-500 mt-2">
                Select a saved location or add a new delivery address.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Location
            </button>
          </div>
        </div>

        {addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;

              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`text-left bg-white border rounded-[2rem] p-5 shadow-sm transition-all ${
                    isSelected
                      ? "border-indigo-500 ring-4 ring-indigo-100"
                      : "border-gray-100 hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          address.label === "Office"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {address.label === "Office" ? (
                          <Building2 className="w-6 h-6" />
                        ) : (
                          <Home className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-gray-950">
                            {address.label}
                          </h3>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>

                        <p className="text-sm font-bold text-gray-700 mt-1">
                          {address.fullName}
                        </p>
                      </div>
                    </div>

                    <span
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-black"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      {address.phone}
                    </p>

                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      {address.region}, {address.city}, {address.area}
                    </p>

                    <p className="text-gray-500">
                      {address.building}, {address.address}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showForm && (
          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-950">
                {editingAddressId ? "Edit Delivery Address" : "Add New Location"}
              </h2>

              <p className="text-gray-500 mt-1">
                Fill in the correct delivery details for your order.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Region
                  </label>

                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Example: Bagmati"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Example: Hetauda"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Building / House No / Street / Floor
                </label>

                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Example: House 12, Parijat Marg, Floor 2"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Area
                </label>

                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Example: Near main road"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Full Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  placeholder="Write complete delivery address..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Address Label
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        label: "Home",
                      })
                    }
                    className={`px-4 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 ${
                      formData.label === "Home"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        label: "Office",
                      })
                    }
                    className={`px-4 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 ${
                      formData.label === "Office"
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    Office
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all"
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </form>
          </div>
        )}

        {addresses.length > 0 && !showForm && (
          <div className="bg-slate-950 text-white rounded-[2rem] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Selected Delivery Location
              </p>

              <h3 className="text-2xl font-black mt-1">
                {addresses.find((address) => address.id === selectedAddressId)
                  ?.label || "No address selected"}
              </h3>
            </div>

            <button
              type="button"
              onClick={proceedToPay}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-4 rounded-2xl inline-flex items-center justify-center gap-2"
            >
              Proceed to Pay
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}