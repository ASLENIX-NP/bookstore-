import React, { useEffect, useMemo, useState } from "react";
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
  Search,
  RefreshCw,
  UploadCloud,
  Sparkles,
  BadgePercent,
  PackageCheck,
  Boxes,
  Tags,
  ImagePlus,
  Save,
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

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return false;
  }

  return startsAt <= now && now < endsAt;
};

const getFlashSaleScheduleStatus = (settings) => {
  if (!settings?.isEnabled) {
    return {
      label: "Disabled",
      description: "Flash sale schedule is currently turned off.",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }

  if (!settings.startsAt || !settings.endsAt) {
    return {
      label: "Incomplete",
      description: "Start and end date/time are required.",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
  }

  const now = new Date();
  const startsAt = new Date(settings.startsAt);
  const endsAt = new Date(settings.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return {
      label: "Invalid",
      description: "Saved flash sale date/time is invalid.",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (now < startsAt) {
    return {
      label: "Scheduled",
      description: `Sale starts on ${formatDateTime(settings.startsAt)}.`,
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  }

  if (now >= startsAt && now < endsAt) {
    return {
      label: "Active",
      description: `Sale is running until ${formatDateTime(settings.endsAt)}.`,
      className: "bg-orange-50 text-orange-700 border-orange-200",
    };
  }

  return {
    label: "Ended",
    description: "Flash sale time has ended.",
    className: "bg-gray-100 text-gray-600 border-gray-200",
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
    actualPrice > 0 ? ((actualPrice - salePrice) / actualPrice) * 100 : 0;

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
  const [searchTerm, setSearchTerm] = useState("");

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
  const [loadingProducts, setLoadingProducts] = useState(true);

  const categories = Object.keys(categoryOptions);
  const subcategories = categoryOptions[formData.category] || [];
  const isEditing = Boolean(editingProductId);

  const flashSaleIsActive = isFlashSaleScheduleActive(flashSaleSettings);
  const scheduleStatus = getFlashSaleScheduleStatus(flashSaleSettings);

  const inventorySummary = useMemo(() => {
    const safeBooks = Array.isArray(books) ? books : [];

    return {
      total: safeBooks.length,
      inStock: safeBooks.filter((book) => book.stockStatus !== "Out of Stock")
        .length,
      outOfStock: safeBooks.filter((book) => book.stockStatus === "Out of Stock")
        .length,
      flashSale: safeBooks.filter((book) => book.flashSale).length,
      featured: safeBooks.filter((book) => book.featured).length,
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const safeBooks = Array.isArray(books) ? books : [];

    if (!search) return safeBooks;

    return safeBooks.filter((book) => {
      return [
        book?.name,
        book?.category,
        book?.subcategory,
        book?.sku,
        book?.barcode,
        book?.description,
        book?.stockStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [books, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoadingProducts(true);

      const response = await axios.get(
        "http://localhost:5000/api/products?admin=true"
      );

      const products = Array.isArray(response.data)
        ? response.data
        : response.data?.products || response.data?.data || [];

      setBooks(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
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

        if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
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
        book.subcategory || categoryOptions[book.category]?.[0] || "School Books",
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
        book.stock !== undefined && book.stock !== null ? String(book.stock) : "",
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
        books.map((book) => (book._id === product._id ? response.data : book))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock status");
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

  const labelClass =
    "block text-[11px] font-black text-gray-400 uppercase tracking-[0.18em] mb-2";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 sm:p-8 shadow-xl shadow-slate-200">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-orange-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Layers className="w-4 h-4" />
              Inventory Management Hub
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Manage Books & Products
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Manage products, categories, stock flags, flash sale schedule,
              custom covers, and barcode records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchBooks();
              fetchFlashSaleSettings();
            }}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-slate-950 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Inventory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <Boxes className="w-5 h-5 text-indigo-600 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Total Items
          </p>
          <p className="text-3xl font-black text-gray-950 mt-2">
            {inventorySummary.total}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <PackageCheck className="w-5 h-5 text-green-600 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            In Stock
          </p>
          <p className="text-3xl font-black text-green-600 mt-2">
            {inventorySummary.inStock}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <XCircle className="w-5 h-5 text-red-600 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Out of Stock
          </p>
          <p className="text-3xl font-black text-red-600 mt-2">
            {inventorySummary.outOfStock}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <BadgePercent className="w-5 h-5 text-orange-600 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Flash Sale
          </p>
          <p className="text-3xl font-black text-orange-600 mt-2">
            {inventorySummary.flashSale}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Featured
          </p>
          <p className="text-3xl font-black text-purple-600 mt-2">
            {inventorySummary.featured}
          </p>
        </div>
      </div>

      <section className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-orange-100 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-orange-50 pb-5">
          <div>
            <h3 className="font-black text-gray-950 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Global Flash Sale Schedule
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Set one start and end date/time. All products marked Flash Sale
              will follow this same schedule.
            </p>
          </div>

          <span
            className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-black border ${scheduleStatus.className}`}
          >
            {scheduleStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className={labelClass}>Schedule</label>

            <label className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 text-sm font-black text-orange-700">
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
            <label className={labelClass}>Start Date & Time</label>

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
              className={inputClass}
            />
          </div>

          <div className="lg:col-span-4">
            <label className={labelClass}>End Date & Time</label>

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
              className={inputClass}
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={handleSaveFlashSaleSchedule}
              disabled={savingSchedule}
              className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-2xl px-4 py-3 text-sm font-black transition"
            >
              <Save className="w-4 h-4" />
              {savingSchedule ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4">
          <p className="text-sm text-orange-700 font-black">
            {scheduleStatus.description}
          </p>

          <div className="mt-2 space-y-1">
            {flashSaleSettings?.isEnabled && flashSaleSettings?.startsAt && (
              <p className="text-xs text-orange-600 font-bold">
                Start: {formatDateTime(flashSaleSettings.startsAt)}
              </p>
            )}

            {flashSaleSettings?.isEnabled && flashSaleSettings?.endsAt && (
              <p className="text-xs text-orange-600 font-bold">
                End: {formatDateTime(flashSaleSettings.endsAt)}
                {flashSaleIsActive
                  ? ` • ${getFlashSaleRemainingText(flashSaleSettings.endsAt)}`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <section className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-gray-100 h-fit space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-gray-950 text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-500" />
                {isEditing ? "Edit Product" : "Add New Product"}
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Fill product details and save to catalog.
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-red-100"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Product Name *</label>

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
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category *</label>

                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Stock Status</label>

                <select
                  value={formData.stockStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockStatus: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Subcategory *</label>

              <select
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subcategory: e.target.value,
                  })
                }
                className={inputClass}
              >
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price (NPR) *</label>

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
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Stock Quantity</label>

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
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["featured", "Featured"],
                ["flashSale", "Flash Sale"],
                ["bestSeller", "Best Seller"],
                ["newArrival", "New Arrival"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 text-sm font-bold rounded-2xl border px-3 py-3 cursor-pointer transition-all ${
                    formData[key]
                      ? "bg-orange-50 border-orange-200 text-orange-700"
                      : "bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: e.target.checked,
                        salePrice:
                          key === "flashSale" && !e.target.checked
                            ? ""
                            : formData.salePrice,
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <label className={labelClass}>Sale Price</label>

              <input
                type="number"
                placeholder={
                  formData.flashSale ? "Example: 499" : "Tick Flash Sale first"
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
                className={inputClass}
              />

              <p className="text-xs text-gray-400 mt-2">
                Sale price applies only when this product is marked Flash Sale
                and the global schedule is active.
              </p>
            </div>

            <div>
              <label className={labelClass}>Product Image</label>

              <label className="group relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-orange-200 rounded-[2rem] cursor-pointer bg-orange-50 hover:bg-orange-100 transition overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow mb-3 text-orange-500">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <p className="text-sm font-black text-gray-700">
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
              <label className={labelClass}>Description</label>

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
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 ${
                isEditing
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-orange-500 hover:bg-orange-600"
              } text-white rounded-2xl py-3.5 text-sm font-black transition-all shadow-sm`}
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

        <section className="xl:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="font-black text-gray-950 text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Active Catalog Items
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Showing {filteredBooks.length} of {books.length} products.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, SKU, category..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {loadingProducts ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

              <p className="ml-3 text-sm font-black text-gray-500">
                Loading products...
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-14">
              <ImagePlus className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              No products found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBooks.map((book) => {
                const saleInfo = getSaleInfo(book, flashSaleIsActive);
                const markedForFlashSale = Boolean(book.flashSale);
                const savedSalePrice =
                  book.salePrice !== undefined &&
                  book.salePrice !== null &&
                  String(book.salePrice).trim() !== "";

                return (
                  <div
                    key={book._id}
                    className={`p-5 transition-all ${
                      editingProductId === book._id
                        ? "bg-indigo-50/70"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                      <div className="flex gap-4 min-w-0">
                        <img
                          src={getProductImage(book.image)}
                          alt={book.name}
                          className="w-20 h-28 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                        />

                        <div className="min-w-0">
                          <h4 className="font-black text-gray-950 text-base sm:text-lg">
                            {book.name}
                          </h4>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {book.featured && (
                              <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-black px-2.5 py-1 rounded-full">
                                Featured
                              </span>
                            )}

                            {markedForFlashSale && flashSaleIsActive && (
                              <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-black px-2.5 py-1 rounded-full">
                                Flash Sale Active •{" "}
                                {getFlashSaleRemainingText(
                                  flashSaleSettings.endsAt
                                )}
                              </span>
                            )}

                            {markedForFlashSale && !flashSaleIsActive && (
                              <span className="bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-black px-2.5 py-1 rounded-full">
                                Flash Sale Ready
                              </span>
                            )}

                            {book.bestSeller && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black px-2.5 py-1 rounded-full">
                                Best Seller
                              </span>
                            )}

                            {book.newArrival && (
                              <span className="bg-green-50 text-green-700 border border-green-100 text-[10px] font-black px-2.5 py-1 rounded-full">
                                New Arrival
                              </span>
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                            <p className="text-gray-500">
                              Category:{" "}
                              <span className="font-black text-gray-700">
                                {book.category}
                              </span>
                            </p>

                            <p className="text-gray-500">
                              Subcategory:{" "}
                              <span className="font-black text-gray-700">
                                {book.subcategory}
                              </span>
                            </p>

                            <p className="text-indigo-500 font-bold">
                              SKU: {book.sku || "N/A"}
                            </p>

                            <p className="text-gray-500">
                              Sold:{" "}
                              <span className="font-black">
                                {book.sold || 0}
                              </span>
                            </p>
                          </div>

                          {book.barcode && (
                            <div className="mt-3 w-full overflow-x-auto bg-white rounded-xl border border-gray-100 p-2">
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
                              <p className="text-xs text-orange-500 mt-2 font-bold">
                                Flash sale window:{" "}
                                {formatDateTime(flashSaleSettings.startsAt)} →{" "}
                                {formatDateTime(flashSaleSettings.endsAt)}
                              </p>
                            )}

                          <p className="text-xs text-gray-500 mt-3 max-w-2xl line-clamp-2">
                            {book.description || "No description added."}
                          </p>
                        </div>
                      </div>

                      <div className="xl:text-right shrink-0">
                        {saleInfo.hasValidSale ? (
                          <div>
                            <p className="font-black text-orange-600 text-lg">
                              {saleInfo.finalPrice === 0
                                ? "FREE"
                                : `NPR ${saleInfo.finalPrice}`}
                            </p>

                            <p className="text-xs text-gray-400 line-through font-bold">
                              NPR {book.price}
                            </p>

                            <p className="text-xs text-red-500 font-black">
                              -{saleInfo.discountPercent.toFixed(2)}%
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-black text-gray-950 text-lg">
                              NPR {book.price}
                            </p>

                            {markedForFlashSale && savedSalePrice && (
                              <p className="text-xs text-orange-500 font-black mt-1">
                                Saved sale price: NPR {book.salePrice}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Stock Left:{" "}
                          <span className="font-black">{book.stock || 0}</span>
                        </p>

                        <div className="flex xl:justify-end items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(book)}
                            className={`text-xs px-3 py-2 rounded-full font-black border ${
                              book.stockStatus === "In Stock"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {book.stockStatus}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(book)}
                            className="w-10 h-10 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center"
                            title="Edit product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(book._id)}
                            className="w-10 h-10 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}