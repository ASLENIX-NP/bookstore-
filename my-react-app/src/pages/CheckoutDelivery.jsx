import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Home,
  Building2,
  Plus,
  Edit3,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  LocateFixed,
  Loader2,
  MapPinned,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LocationPickerModal from "../components/LocationPickerModal";

const emptyAddress = {
  fullName: "",
  phone: "",
  region: "",
  city: "",
  building: "",
  area: "",
  address: "",
  label: "Home",
  lat: "",
  lng: "",
};

export default function CheckoutDelivery() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [deliveryPreview, setDeliveryPreview] = useState(null);
  const [deliveryPreviewLoading, setDeliveryPreviewLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const getCheckoutItems = () => {
    try {
      const checkoutItems = JSON.parse(
        localStorage.getItem("checkoutItems") || "[]"
      );

      if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
        return checkoutItems;
      }

      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const fixedCartItems = cartItems.map((item) => {
          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.price || 0);

          return {
            _id: item._id || item.productId || item.id,
            productId: item.productId || item._id || item.id,
            title: item.title || item.name || "Product",
            name: item.name || item.title || "Product",
            price,
            image: item.image || "",
            quantity: qty,
            qty,
            subtotal: price * qty,
          };
        });

        localStorage.setItem("checkoutItems", JSON.stringify(fixedCartItems));
        localStorage.setItem("checkoutType", "Cart");

        return fixedCartItems;
      }

      const buyNowItem = JSON.parse(
        localStorage.getItem("buyNowItem") || "null"
      );

      if (buyNowItem) {
        const fixedBuyNowItems = Array.isArray(buyNowItem)
          ? buyNowItem
          : [buyNowItem];

        localStorage.setItem("checkoutItems", JSON.stringify(fixedBuyNowItems));
        localStorage.setItem("checkoutType", "Buy Now");

        return fixedBuyNowItems;
      }

      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to continue checkout.");
      navigate("/login", { state: { from: "/checkout/delivery" } });
      return;
    }

    const checkoutItems = getCheckoutItems();

    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("Please select products before checkout.");
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

  useEffect(() => {
    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    const lat = Number(selectedAddress?.lat);
    const lng = Number(selectedAddress?.lng);

    if (!selectedAddress || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setDeliveryPreview(null);
      return;
    }

    const calculatePreview = async () => {
      try {
        setDeliveryPreviewLoading(true);

        const response = await fetch(
          "https://bookstore-f3if.onrender.com/api/delivery/calculate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat, lng }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to calculate delivery");
        }

        setDeliveryPreview(data.delivery);
      } catch (error) {
        console.error("Delivery preview error:", error);
        setDeliveryPreview(null);
      } finally {
        setDeliveryPreviewLoading(false);
      }
    };

    calculatePreview();
  }, [addresses, selectedAddressId]);

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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by this browser.");
      return;
    }

    toast.loading("Getting your current location...", {
      id: "location-loading",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        toast.success("Current location added successfully.", {
          id: "location-loading",
        });
      },
      () => {
        toast.error("Could not get your location. Please allow location access.", {
          id: "location-loading",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSelectOnMap = () => {
    setMapPickerOpen(true);
  };

  const handleConfirmMapLocation = (location) => {
    setFormData((prev) => ({
      ...prev,
      lat: location.lat,
      lng: location.lng,
    }));

    setMapPickerOpen(false);
    toast.success("Map location selected successfully.");
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
      toast.error("Please fill in all delivery information.");
      return false;
    }

    const lat = Number(formData.lat);
    const lng = Number(formData.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error(
        "Please use current location or select delivery location on map."
      );
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
              lat: Number(formData.lat),
              lng: Number(formData.lng),
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
        lat: Number(formData.lat),
        lng: Number(formData.lng),
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
      lat: address.lat || "",
      lng: address.lng || "",
    });

    setShowForm(true);
  };

  const proceedToPay = () => {
    const checkoutItems = getCheckoutItems();

    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error("No checkout products found. Please select products first.");
      navigate("/cart");
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    const lat = Number(selectedAddress.lat);
    const lng = Number(selectedAddress.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error(
        "This address has no delivery location. Please edit it and use current location or select on map."
      );
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
            <Link
  to="/products"
  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors mb-4"
>
  ← Back to Products
</Link>

<div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-4">
  <MapPin className="w-4 h-4" />
  Delivery Information
</div>

              <h1 className="text-3xl md:text-4xl font-black text-gray-950">
                Choose Delivery Address
              </h1>

              <p className="text-gray-500 mt-2">
                Use current location or select delivery destination on map.
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
              const hasLocation =
                Number.isFinite(Number(address.lat)) &&
                Number.isFinite(Number(address.lng));

              return (
                <div
                  key={address.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAddressId(address.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelectedAddressId(address.id);
                  }}
                  className={`text-left bg-white border rounded-[2rem] p-5 shadow-sm transition-all cursor-pointer ${
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

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-black"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span>{address.phone}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>
                        {address.building}, {address.area}, {address.city},{" "}
                        {address.region}
                        {address.address ? `, ${address.address}` : ""}
                      </span>
                    </div>

                    {hasLocation ? (
                      <p className="text-xs font-bold text-emerald-600">
                        Delivery location saved:{" "}
                        {Number(address.lat).toFixed(5)},{" "}
                        {Number(address.lng).toFixed(5)}
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-red-500">
                        Delivery location missing. Edit and select location.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSaveAddress}
            className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                {editingAddressId
                  ? "Edit Delivery Location"
                  : "New Delivery Location"}
              </p>

              <h2 className="text-2xl font-black text-gray-950 mt-1">
                Delivery Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Region
                </label>

                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Example: Gandaki"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Example: Pokhara"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Building / House / Street / Floor
                </label>

                <input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="House no, street, floor"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Area
                </label>

                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Area name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Address Details
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  placeholder="Nearby landmark or additional delivery instruction"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Delivery Location Coordinates
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Choose the exact delivery destination for distance-based
                        delivery charge.
                      </p>

                      {formData.lat && formData.lng ? (
                        <p className="text-xs font-bold text-emerald-600 mt-2">
                          Location selected: {Number(formData.lat).toFixed(5)},{" "}
                          {Number(formData.lng).toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-red-500 mt-2">
                          No delivery location selected yet.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl text-sm font-black transition-all"
                      >
                        <LocateFixed className="w-4 h-4" />
                        Use Current Location
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectOnMap}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl text-sm font-black transition-all"
                      >
                        <MapPinned className="w-4 h-4" />
                        Select on Map
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 bg-white border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
                    <span className="font-black text-slate-800">
                      Example:
                    </span>{" "}
                    If you are in Kathmandu but want delivery in Pokhara, click{" "}
                    <span className="font-black text-indigo-600">
                      Select on Map
                    </span>{" "}
                    and choose the Pokhara delivery location.
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
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
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black border ${
                      formData.label === "Home"
                        ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                        : "bg-slate-50 text-gray-600 border-gray-100"
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
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black border ${
                      formData.label === "Office"
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-slate-50 text-gray-600 border-gray-100"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    Office
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-sm font-black transition-all"
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddressId(null);
                    setFormData(emptyAddress);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl text-sm font-black transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-950">
                Delivery Information
              </h3>

              <p className="text-sm text-gray-500">
                Estimated delivery time and shipping charge
              </p>
            </div>
          </div>

          {deliveryPreviewLoading ? (
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculating delivery...
            </div>
          ) : deliveryPreview ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">
                  Estimated Delivery
                </p>

                <h4 className="text-2xl font-black text-gray-950">
                  {deliveryPreview.days}
                </h4>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">
                  Delivery Charge
                </p>

                <h4 className="text-2xl font-black text-gray-950">
                  NPR {Number(deliveryPreview.charge || 0).toLocaleString()}
                </h4>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">
                  Distance
                </p>

                <h4 className="text-2xl font-black text-gray-950">
                  {deliveryPreview.distanceKm} km
                </h4>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 font-bold">
              Select an address with saved delivery location to calculate
              delivery.
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black text-gray-950">
              Ready to continue?
            </p>

            <p className="text-sm text-gray-500">
              Your selected delivery address and map location will be used for
              this order.
            </p>
          </div>

          <button
            type="button"
            onClick={proceedToPay}
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-4 rounded-2xl text-sm font-black transition-all"
          >
            Proceed to Pay
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <LocationPickerModal
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onConfirm={handleConfirmMapLocation}
        initialLocation={
          formData.lat && formData.lng
            ? {
                lat: Number(formData.lat),
                lng: Number(formData.lng),
              }
            : null
        }
      />
    </div>
  );
}