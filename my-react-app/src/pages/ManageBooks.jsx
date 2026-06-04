import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Barcode from "react-barcode";
import {
  PlusCircle,
  Layers,
  Trash2,
  BookOpen,
  Pencil,
  XCircle,
  Clock,
} from "lucide-react";

const categoryOptions = {
  "Academic Books": [
    "School Books",
    "College Books",
    "Guide Books",
    "Question Banks",
  ],

  "Novels & Literature": [
    "Nepali Novels",
    "English Novels",
    "Self Help",
    "Biography",
    "Poetry",
    "Romance",
    "Mystery / Thriller",
    "History",
  ],

  "Children's Books": [
    "Story Books",
    "Comics",
    "Coloring Books",
    "Alphabet Books",
    "Activity Books",
    "Picture Books",
  ],

  "Religious Books": ["General Religious Books"],

  "Notebooks, Copies & Files": [
    "Single Line Copies",
    "Four Line Copies",
    "Drawing Copies",
    "Register Copies",
    "Practical Copies",
    "Diaries / Journals",
    "Files",
    "Folders",
  ],

  "Magazines & Newspapers": [
    "Newspapers",
    "Educational Magazines",
    "Monthly Magazines",
    "Comics Magazines",
    "Current Affairs Magazines",
  ],

  "Stationery Items": [
    "Pens",
    "Pencils",
    "Erasers",
    "Sharpeners",
    "Markers",
    "Highlighters",
    "Geometry Box",
    "Scales",
    "Art Supplies",
    "Office Supplies",
  ],
};

const emptyFormData = {
  name: "",
  category: "Academic Books",
  subcategory: "School Books",
  price: "",
  salePrice: "",
  image: "",
  stockStatus: "In Stock",
  stock: "",
  description: "",
  featured: false,
  flashSale: false,
  bestSeller: false,
  newArrival: false,
};

const placeholderImage =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getProductImage = (image) => {
  if (image && String(image).startsWith("http")) {
    return image;
  }

  return placeholderImage;
};

const formatDateTime = (value) => {
  if (!value) return "";

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }

  return dateValue.toLocaleString();
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }

  const timezoneOffset = dateValue.getTimezoneOffset() * 60000;
  const localDate = new Date(dateValue.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
};

const fromDateTimeLocalValue = (value) => {
  if (!value) return "";

  const dateValue = new Date(value);

  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }

  return dateValue.toISOString();
};

const isFlashSaleScheduleActive = (settings) => {
  if (!settings?.isEnabled) return false;
  if (!settings.startsAt || !settings.endsAt) return false;

  const now = new Date();
  const startsAt = new Date(settings.startsAt);
  const endsAt = new Date(settings.endsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime())
  ) {
    return false;
  }

  return startsAt <= now && now < endsAt;
};

const getFlashSaleScheduleStatus = (settings) => {
  if (!settings?.isEnabled) {
    return {
      label: "Disabled",
      description: "Flash sale schedule is currently turned off.",
      className: "bg-gray-100 text-gray-600",
    };
  }

  if (!settings.startsAt || !settings.endsAt) {
    return {
      label: "Incomplete",
      description: "Start and end date/time are required.",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  const now = new Date();
  const startsAt = new Date(settings.startsAt);
  const endsAt = new Date(settings.endsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime())
  ) {
    return {
      label: "Invalid",
      description: "Saved flash sale date/time is invalid.",
      className: "bg-red-100 text-red-700",
    };
  }

  if (now < startsAt) {
    return {
      label: "Scheduled",
      description: `Sale starts on ${formatDateTime(settings.startsAt)}.`,
      className: "bg-indigo-100 text-indigo-700",
    };
  }

  if (now >= startsAt && now < endsAt) {
    return {
      label: "Active",
      description: `Sale is running until ${formatDateTime(settings.endsAt)}.`,
      className: "bg-orange-100 text-orange-700",
    };
  }

  return {
    label: "Ended",
    description: "Flash sale time has ended.",
    className: "bg-gray-100 text-gray-600",
  };
};

const getFlashSaleRemainingText = (endsAt) => {
  if (!endsAt) return "No end time";

  const endDate = new Date(endsAt);
  const now = new Date();

  if (Number.isNaN(endDate.getTime())) {
    return "Invalid end time";
  }

  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
};

const getSaleInfo = (book, flashSaleIsActive) => {
  const actualPrice = Number(book?.price || 0);
  const salePrice = Number(book?.salePrice);

  const hasValidSale =
    flashSaleIsActive &&
    book?.flashSale &&
    book?.salePrice !== undefined &&
    book?.salePrice !== null &&
    String(book?.salePrice).trim() !== "" &&
    Number.isFinite(salePrice) &&
    salePrice >= 0 &&
    salePrice < actualPrice;

  if (!hasValidSale) {
    return {
      hasValidSale: false,
      finalPrice: actualPrice,
      discountPercent: 0,
    };
  }

  const discountPercent =
    actualPrice > 0
      ? ((actualPrice - salePrice) / actualPrice) * 100
      : 0;

  return {
    hasValidSale: true,
    finalPrice: salePrice,
    discountPercent,
  };
};

const handleNumberInputWheel = (e) => {
  e.currentTarget.blur();
};

const handleNumberInputKeyDown = (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
  }
};

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(emptyFormData);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const [flashSaleSettings, setFlashSaleSettings] = useState({
    isEnabled: false,
    isActive: false,
    startsAt: "",
    endsAt: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    isEnabled: false,
    startsAt: "",
    endsAt: "",
  });

  const [savingSchedule, setSavingSchedule] = useState(false);

  const categories = Object.keys(categoryOptions);
  const subcategories = categoryOptions[formData.category] || [];
  const isEditing = Boolean(editingProductId);

  const flashSaleIsActive = isFlashSaleScheduleActive(flashSaleSettings);
  const scheduleStatus = getFlashSaleScheduleStatus(flashSaleSettings);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products?admin=true"
      );

      setBooks(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  const fetchFlashSaleSettings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/flash-sale-settings"
      );

      const settings = response.data?.settings || {
        isEnabled: false,
        startsAt: "",
        endsAt: "",
      };

      setFlashSaleSettings(settings);

      setScheduleForm({
        isEnabled: Boolean(settings.isEnabled),
        startsAt: toDateTimeLocalValue(settings.startsAt),
        endsAt: toDateTimeLocalValue(settings.endsAt),
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load flash sale schedule");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchFlashSaleSettings();
  }, []);

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingProductId(null);
    setImagePreview("");
    setFileInputKey(Date.now());
  };

  const handleCategoryChange = (selectedCategory) => {
    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory: categoryOptions[selectedCategory][0],
    });
  };

  const handleSaveFlashSaleSchedule = async () => {
    try {
      setSavingSchedule(true);

      if (scheduleForm.isEnabled) {
        if (!scheduleForm.startsAt || !scheduleForm.endsAt) {
          toast.error("Start and end date/time are required");
          return;
        }

        const startsAt = new Date(scheduleForm.startsAt);
        const endsAt = new Date(scheduleForm.endsAt);

        if (
          Number.isNaN(startsAt.getTime()) ||
          Number.isNaN(endsAt.getTime())
        ) {
          toast.error("Invalid start or end date/time");
          return;
        }

        if (endsAt <= startsAt) {
          toast.error("End time must be after start time");
          return;
        }

        if (endsAt <= new Date()) {
          toast.error("End time must be in the future");
          return;
        }
      }

      const payload = {
        isEnabled: scheduleForm.isEnabled,
        startsAt: scheduleForm.isEnabled
          ? fromDateTimeLocalValue(scheduleForm.startsAt)
          : "",
        endsAt: scheduleForm.isEnabled
          ? fromDateTimeLocalValue(scheduleForm.endsAt)
          : "",
      };

      const response = await axios.put(
        "http://localhost:5000/api/admin/flash-sale-settings",
        payload
      );

      const updatedSettings = response.data?.settings || {
        isEnabled: false,
        startsAt: "",
        endsAt: "",
      };

      setFlashSaleSettings(updatedSettings);

      setScheduleForm({
        isEnabled: Boolean(updatedSettings.isEnabled),
        startsAt: toDateTimeLocalValue(updatedSettings.startsAt),
        endsAt: toDateTimeLocalValue(updatedSettings.endsAt),
      });

      await fetchBooks();

      toast.success(response.data?.message || "Flash sale schedule saved");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save flash sale schedule"
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const buildProductFormData = () => {
    const data = new FormData();

    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("subcategory", formData.subcategory);
    data.append("price", formData.price);
    data.append("salePrice", formData.flashSale ? formData.salePrice : "");
    data.append("stockStatus", formData.stockStatus);
    data.append("stock", formData.stock);
    data.append("description", formData.description);

    data.append("featured", formData.featured);
    data.append("flashSale", formData.flashSale);
    data.append("bestSeller", formData.bestSeller);
    data.append("newArrival", formData.newArrival);

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (formData.price === "" || Number(formData.price) < 0) {
      toast.error("Valid product price is required");
      return;
    }

    if (formData.flashSale) {
      const actualPrice = Number(formData.price);
      const salePrice = Number(formData.salePrice);

      if (
        formData.salePrice === "" ||
        !Number.isFinite(salePrice) ||
        salePrice < 0
      ) {
        toast.error("Sale price is required for Flash Sale");
        return;
      }

      if (salePrice >= actualPrice) {
        toast.error("Sale price must be less than actual price");
        return;
      }
    }

    try {
      const data = buildProductFormData();

      if (isEditing) {
        const response = await axios.put(
          `http://localhost:5000/api/products/${editingProductId}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setBooks(
          books.map((book) =>
            book._id === editingProductId ? response.data : book
          )
        );

        toast.success("Product updated successfully");
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/products",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setBooks([response.data, ...books]);

        toast.success("Product added successfully");
      }

      resetForm();
      await fetchBooks();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          (isEditing ? "Failed to update product" : "Failed to add product")
      );
    }
  };

  const handleEdit = (book) => {
    setEditingProductId(book._id);

    setFormData({
      name: book.name || "",
      category: book.category || "Academic Books",
      subcategory:
        book.subcategory ||
        categoryOptions[book.category]?.[0] ||
        "School Books",
      price:
        book.price !== undefined && book.price !== null
          ? String(book.price)
          : "",
      salePrice:
        book.salePrice !== undefined && book.salePrice !== null
          ? String(book.salePrice)
          : "",
      image: "",
      stockStatus: book.stockStatus || "In Stock",
      stock:
        book.stock !== undefined && book.stock !== null
          ? String(book.stock)
          : "",
      description: book.description || "",
      featured: Boolean(book.featured),
      flashSale: Boolean(book.flashSale),
      bestSeller: Boolean(book.bestSeller),
      newArrival: Boolean(book.newArrival),
    });

    setImagePreview(getProductImage(book.image));
    setFileInputKey(Date.now());

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);

      setBooks(books.filter((book) => book._id !== id));

      if (editingProductId === id) {
        resetForm();
      }

      toast.success("Product deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStock = async (product) => {
    try {
      const updatedStatus =
        product.stockStatus === "In Stock" ? "Out of Stock" : "In Stock";

      const response = await axios.patch(
        `http://localhost:5000/api/products/${product._id}`,
        {
          stockStatus: updatedStatus,
        }
      );

      setBooks(
        books.map((book) =>
          book._id === product._id ? response.data : book
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock status");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="text-orange-500 w-6 h-6 shrink-0" />
          Inventory Management Hub
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage products, categories, stock flags, flash sale schedule, and
          custom covers.
        </p>
      </div>

      <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-orange-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-orange-50 pb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Global Flash Sale Schedule
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Set one start and end date/time. All products marked Flash Sale
              will follow this same schedule.
            </p>
          </div>

          <span
            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold ${scheduleStatus.className}`}
          >
            {scheduleStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Schedule
            </label>

            <label className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-2 text-sm font-semibold text-orange-700">
              <input
                type="checkbox"
                checked={scheduleForm.isEnabled}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    isEnabled: e.target.checked,
                  })
                }
              />
              Enable
            </label>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Start Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduleForm.startsAt}
              disabled={!scheduleForm.isEnabled}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  startsAt: e.target.value,
                })
              }
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              End Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduleForm.endsAt}
              disabled={!scheduleForm.isEnabled}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  endsAt: e.target.value,
                })
              }
              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleSaveFlashSaleSchedule}
              disabled={savingSchedule}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl px-4 py-2 text-sm font-semibold transition"
            >
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>

        <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4">
          <p className="text-xs text-orange-700 font-semibold">
            {scheduleStatus.description}
          </p>

          {flashSaleSettings?.isEnabled && flashSaleSettings?.startsAt && (
            <p className="text-[11px] text-orange-600 mt-1">
              Start: {formatDateTime(flashSaleSettings.startsAt)}
            </p>
          )}

          {flashSaleSettings?.isEnabled && flashSaleSettings?.endsAt && (
            <p className="text-[11px] text-orange-600 mt-1">
              End: {formatDateTime(flashSaleSettings.endsAt)}
              {flashSaleIsActive
                ? ` • ${getFlashSaleRemainingText(flashSaleSettings.endsAt)}`
                : ""}
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-orange-500" />
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>

              <input
                type="text"
                placeholder="Example: Mathematics Grade 10"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Category *
                </label>

                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Stock Status
                </label>

                <select
                  value={formData.stockStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockStatus: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Subcategory *
              </label>

              <select
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subcategory: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Price (NPR) *
              </label>

              <input
                type="number"
                placeholder="650"
                value={formData.price}
                min="0"
                step="any"
                onWheel={handleNumberInputWheel}
                onKeyDown={handleNumberInputKeyDown}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Stock Quantity
              </label>

              <input
                type="number"
                placeholder="50"
                value={formData.stock}
                min="0"
                step="1"
                onWheel={handleNumberInputWheel}
                onKeyDown={handleNumberInputKeyDown}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured: e.target.checked,
                    })
                  }
                />
                Featured Product
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.flashSale}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flashSale: e.target.checked,
                      salePrice: e.target.checked ? formData.salePrice : "",
                    })
                  }
                />
                Flash Sale
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.bestSeller}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bestSeller: e.target.checked,
                    })
                  }
                />
                Best Seller
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.newArrival}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newArrival: e.target.checked,
                    })
                  }
                />
                New Arrival
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Sale Price
              </label>

              <input
                type="number"
                placeholder={
                  formData.flashSale
                    ? "Example: 499"
                    : "Tick Flash Sale first"
                }
                value={formData.salePrice}
                disabled={!formData.flashSale}
                min="0"
                step="any"
                onWheel={handleNumberInputWheel}
                onKeyDown={handleNumberInputKeyDown}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />

              <p className="text-[11px] text-gray-400 mt-1">
                Sale price applies only when this product is marked Flash Sale
                and the global schedule is active.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Product Image
              </label>

              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-orange-200 rounded-2xl cursor-pointer bg-orange-50 hover:bg-orange-100 transition overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow mb-3">
                      <span className="text-2xl">📚</span>
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      Click to upload product image
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, JPEG
                    </p>
                  </div>
                )}

                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (file) {
                      setFormData({
                        ...formData,
                        image: file,
                      });

                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Description
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Write book description..."
                rows="4"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 ${
                isEditing
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-orange-500 hover:bg-orange-600"
              } text-white rounded-xl py-3 text-sm font-semibold`}
            >
              {isEditing ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}

              {isEditing ? "UPDATE PRODUCT" : "SAVE INTO CATALOG"}
            </button>
          </form>
        </section>

        <section className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3 mb-5">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Currently Active Items ({books.length})
          </h3>

          <div className="space-y-4">
            {books.map((book) => {
              const saleInfo = getSaleInfo(book, flashSaleIsActive);
              const markedForFlashSale = Boolean(book.flashSale);
              const savedSalePrice =
                book.salePrice !== undefined &&
                book.salePrice !== null &&
                String(book.salePrice).trim() !== "";

              return (
                <div
                  key={book._id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 gap-4 ${
                    editingProductId === book._id
                      ? "bg-indigo-50/60 rounded-xl p-3 border border-indigo-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getProductImage(book.image)}
                      alt={book.name}
                      className="w-16 h-20 rounded-lg object-cover border"
                    />

                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {book.name}
                      </h4>

                      <div className="flex flex-wrap gap-2 mt-1">
                        {book.featured && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}

                        {markedForFlashSale && flashSaleIsActive && (
                          <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full">
                            Flash Sale Active •{" "}
                            {getFlashSaleRemainingText(
                              flashSaleSettings.endsAt
                            )}
                          </span>
                        )}

                        {markedForFlashSale && !flashSaleIsActive && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-1 rounded-full">
                            Flash Sale Ready
                          </span>
                        )}

                        {book.bestSeller && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-1 rounded-full">
                            Best Seller
                          </span>
                        )}

                        {book.newArrival && (
                          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full">
                            New Arrival
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {book.category}
                      </p>

                      <p className="text-xs text-gray-400">
                        {book.subcategory}
                      </p>

                      <p className="text-xs text-indigo-500 mt-1">
                        SKU: {book.sku}
                      </p>

                      {book.barcode && (
                        <div className="w-full overflow-x-auto">
                          <Barcode
                            value={book.barcode}
                            width={0.8}
                            height={35}
                            fontSize={10}
                            margin={0}
                            displayValue
                          />
                        </div>
                      )}

                      {markedForFlashSale &&
                        flashSaleSettings?.isEnabled &&
                        flashSaleSettings?.startsAt && (
                          <p className="text-xs text-orange-500 mt-1">
                            Flash sale window:{" "}
                            {formatDateTime(flashSaleSettings.startsAt)} →{" "}
                            {formatDateTime(flashSaleSettings.endsAt)}
                          </p>
                        )}

                      <p className="text-xs text-gray-500 mt-2 max-w-md">
                        {book.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      {saleInfo.hasValidSale ? (
                        <div>
                          <p className="font-bold text-orange-600">
                            {saleInfo.finalPrice === 0
                              ? "FREE"
                              : `NPR ${saleInfo.finalPrice}`}
                          </p>

                          <p className="text-xs text-gray-400 line-through">
                            NPR {book.price}
                          </p>

                          <p className="text-[11px] text-red-500 font-semibold">
                            -{saleInfo.discountPercent.toFixed(2)}%
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-800">
                            NPR {book.price}
                          </p>

                          {markedForFlashSale && savedSalePrice && (
                            <p className="text-[11px] text-orange-500 font-semibold mt-1">
                              Saved sale price: NPR {book.salePrice}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        Stock Left: {book.stock || 0}
                      </p>

                      <p className="text-xs text-gray-400">
                        Sold: {book.sold || 0}
                      </p>

                      <button
                        onClick={() => handleToggleStock(book)}
                        className={`text-xs px-3 py-1 rounded-full mt-2 ${
                          book.stockStatus === "In Stock"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {book.stockStatus}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-indigo-500 hover:text-indigo-700"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(book._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {books.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                No products added yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}