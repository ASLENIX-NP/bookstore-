import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  AlertCircle,
  Star,
  Heart,
  Search,
  RotateCcw,
  BookOpen,
  PackageCheck,
  Grid3X3,
  SlidersHorizontal,
  Loader2,
  Sparkles,
  Flame,
  BadgePercent,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

const collectionOptions = [
  {
    value: "all",
    label: "All Products",
    title: "Shop Products",
    subtitle:
      "Browse books, newspapers, magazines, stationery, and learning essentials.",
  },
  {
    value: "featured",
    label: "Featured Collection",
    title: "Featured Collection",
    subtitle: "Handpicked products selected for readers and learners.",
  },
  {
    value: "flashSale",
    label: "Flash Sale",
    title: "Flash Sale Products",
    subtitle: "Special products and limited-time selections for quick buyers.",
  },
  {
    value: "bestSeller",
    label: "Best Sellers",
    title: "Best Selling Products",
    subtitle: "Popular choices customers are buying and reviewing.",
  },
  {
    value: "newArrival",
    label: "New Arrivals",
    title: "New Arrival Products",
    subtitle: "Freshly added products from the latest collection.",
  },
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price Low" },
  { value: "price-high", label: "Price High" },
  { value: "rating", label: "Rating" },
];

const CART_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  if (String(image).startsWith("data:image")) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
};

const getNumberValue = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getOriginalPrice = (product) => {
  return Math.max(0, getNumberValue(product?.price));
};

const getRawSalePriceValue = (product) => {
  const possibleFields = [
    product?.salePrice,
    product?.discountPrice,
    product?.discountedPrice,
    product?.offerPrice,
    product?.specialPrice,
    product?.flashSalePrice,
  ];

  return possibleFields.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );
};

const getSalePriceNumber = (product) => {
  const rawSalePrice = getRawSalePriceValue(product);

  if (rawSalePrice === undefined) {
    return null;
  }

  const salePrice = Number(rawSalePrice);

  return Number.isFinite(salePrice) ? salePrice : null;
};

const hasValidSalePrice = (product, allowSalePrice = true) => {
  const originalPrice = getOriginalPrice(product);
  const salePrice = getSalePriceNumber(product);

  return (
    allowSalePrice &&
    originalPrice > 0 &&
    salePrice !== null &&
    salePrice >= 0 &&
    salePrice < originalPrice
  );
};

const getFinalPrice = (product, allowSalePrice = true) => {
  if (hasValidSalePrice(product, allowSalePrice)) {
    return Math.max(0, getSalePriceNumber(product));
  }

  return getOriginalPrice(product);
};

const getDiscountPercent = (product, allowSalePrice = true) => {
  if (!hasValidSalePrice(product, allowSalePrice)) return "0";

  const originalPrice = getOriginalPrice(product);
  const salePrice = getFinalPrice(product, allowSalePrice);

  const discount = ((originalPrice - salePrice) / originalPrice) * 100;

  if (salePrice === 0) {
    return "100";
  }

  return discount.toFixed(2).replace(/\.00$/, "");
};

const getDisplayPriceText = (product, allowSalePrice = true) => {
  const finalPrice = getFinalPrice(product, allowSalePrice);

  if (hasValidSalePrice(product, allowSalePrice) && finalPrice === 0) {
    return "FREE";
  }

  return `NPR ${finalPrice.toLocaleString()}`;
};

const getCollectionApiUrl = (collection) => {
  const baseUrl = "http://localhost:5000/api/products";

  if (collection === "featured") {
    return `${baseUrl}?featured=true`;
  }

  if (collection === "flashSale") {
    return `${baseUrl}?flashSale=true`;
  }

  if (collection === "bestSeller") {
    return `${baseUrl}?bestSeller=true`;
  }

  if (collection === "newArrival") {
    return `${baseUrl}?newArrival=true`;
  }

  return baseUrl;
};

const ProductImage = ({ src, alt, className }) => {
  const fallbackUrl =
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=700&q=80";

  const handleError = (e) => {
    e.target.src = fallbackUrl;
  };

  return (
    <img
      src={src || fallbackUrl}
      alt={alt || "Product"}
      className={className}
      onError={handleError}
    />
  );
};

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const collectionFromUrl = searchParams.get("collection") || "all";

  const [products, setProducts] = useState([]);
  const [selectedCollection, setSelectedCollection] =
    useState(collectionFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchBoxRef = useRef(null);
  const filterPanelRef = useRef(null);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const categories = Object.keys(categoryOptions);

  const subcategories =
    selectedCategory === "all" ? [] : categoryOptions[selectedCategory] || [];

  const isFlashCollection = selectedCollection === "flashSale";

  const isSaleEligibleProduct = (product) => {
    return isFlashCollection || product?.flashSale === true;
  };

  useEffect(() => {
    const currentCollection = searchParams.get("collection") || "all";
    setSelectedCollection(currentCollection);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const apiUrl = getCollectionApiUrl(selectedCollection);
        const response = await axios.get(apiUrl);

        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCollection]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowSearchSuggestions(false);
      }

      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target)
      ) {
        setOpenMobileDropdown("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizeText = (value) => {
    return String(value || "").toLowerCase().trim();
  };

  const getProductSearchText = (product) => {
    return [
      product.name,
      product.title,
      product.category,
      product.subcategory,
      product.language,
      product.author,
      product.publisher,
      product.description,
      product.details,
    ]
      .map((item) => normalizeText(item))
      .join(" ");
  };

  const getShortcutWords = (query) => {
    const cleanQuery = normalizeText(query);

    const shortcutMap = {
      e: ["english"],
      en: ["english"],
      eng: ["english"],
      n: ["nepali"],
      ne: ["nepali"],
      nep: ["nepali"],
      h: ["hindi"],
      hi: ["hindi"],
    };

    return shortcutMap[cleanQuery] || [];
  };

  const productMatchesSearch = (product, value) => {
    const query = normalizeText(value);

    if (!query) {
      return true;
    }

    const productText = getProductSearchText(product);
    const shortcutWords = getShortcutWords(query);

    const shortcutOnlyQueries = [
      "e",
      "en",
      "eng",
      "n",
      "ne",
      "nep",
      "h",
      "hi",
    ];

    if (shortcutOnlyQueries.includes(query)) {
      return shortcutWords.some((word) => productText.includes(word));
    }

    return (
      productText.includes(query) ||
      shortcutWords.some((word) => productText.includes(word))
    );
  };

  const getSuggestionLabel = (product) => {
    const query = normalizeText(searchTerm);
    const productText = getProductSearchText(product);

    if (["e", "en", "eng"].includes(query) && productText.includes("english")) {
      return "English book recommendation";
    }

    if (["n", "ne", "nep"].includes(query) && productText.includes("nepali")) {
      return "Nepali book recommendation";
    }

    if (["h", "hi"].includes(query) && productText.includes("hindi")) {
      return "Hindi book recommendation";
    }

    if (product.subcategory) {
      return product.subcategory;
    }

    if (product.category) {
      return product.category;
    }

    return "Product suggestion";
  };

  const searchSuggestions =
    searchTerm.trim() === ""
      ? []
      : products
          .filter((product) => productMatchesSearch(product, searchTerm))
          .slice(0, 8);

  const getStatus = (product) => {
    return product.stockStatus || product.statusFlag || "In Stock";
  };

  const getCurrentCollectionInfo = () => {
    return (
      collectionOptions.find((item) => item.value === selectedCollection) ||
      collectionOptions[0]
    );
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSearchTerm("");
    setShowSearchSuggestions(false);
    setSortBy("name");
    setOpenMobileDropdown("");

    if (collection === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ collection });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("all");
    setOpenMobileDropdown("");
  };

  const resetFilters = () => {
    setSelectedCollection("all");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSortBy("name");
    setSearchTerm("");
    setShowSearchSuggestions(false);
    setOpenMobileDropdown("");
    setSearchParams({});
  };

  const addToCart = (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to add products to cart.");
      navigate("/login", {
        state: { from: "/products" },
      });
      return;
    }

    const status = getStatus(product);
    const isOutOfStock = status.toLowerCase() === "out of stock";

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const finalPrice = getFinalPrice(product, isSaleEligibleProduct(product));

      currentCart.push({
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: finalPrice,
        image: getSafeCartImage(product.image),
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first to buy products.");
      navigate("/login", {
        state: { from: "/products" },
      });
      return;
    }

    const status = getStatus(product);
    const isOutOfStock = status.toLowerCase() === "out of stock";

    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    const finalPrice = getFinalPrice(product, isSaleEligibleProduct(product));

    const buyNowProduct = [
      {
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: finalPrice,
        image: getSafeCartImage(product.image),
        quantity: 1,
        subtotal: finalPrice,
      },
    ];

    localStorage.setItem("checkoutItems", JSON.stringify(buyNowProduct));
    localStorage.setItem("checkoutType", "Buy Now");

    navigate("/checkout/delivery");
  };

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const restoreScrollAfterWishlist = (top, left) => {
    requestAnimationFrame(() => {
      window.scrollTo(left, top);
    });

    setTimeout(() => {
      window.scrollTo(left, top);
    }, 0);

    setTimeout(() => {
      window.scrollTo(left, top);
    }, 50);
  };

  const handleWishlistClick = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    let latestWishlist = [];

    try {
      latestWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch {
      latestWishlist = [];
    }

    const existing = latestWishlist.find((item) => item._id === product._id);

    let updatedWishlist = [];

    if (existing) {
      updatedWishlist = latestWishlist.filter(
        (item) => item._id !== product._id
      );

      toast.success("Removed from wishlist");
    } else {
      updatedWishlist = [...latestWishlist, product];

      toast.success("Added to wishlist");
    }

    setWishlist(updatedWishlist);

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

    window.dispatchEvent(new Event("wishlistUpdated"));

    restoreScrollAfterWishlist(scrollTop, scrollLeft);
  };

  const totalInStock = products.filter(
    (product) => getStatus(product) === "In Stock"
  ).length;

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" || product.category === selectedCategory;

    const subcategoryMatch =
      selectedSubcategory === "all" ||
      product.subcategory === selectedSubcategory;

    const searchMatch = productMatchesSearch(product, searchTerm);

    return categoryMatch && subcategoryMatch && searchMatch;
  });

  const getDisplayPrice = (product) => {
    return getFinalPrice(product, isSaleEligibleProduct(product));
  };

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return getDisplayPrice(a) - getDisplayPrice(b);
    }

    if (sortBy === "price-high") {
      return getDisplayPrice(b) - getDisplayPrice(a);
    }

    if (sortBy === "rating") {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }

    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }

    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  const currentCollectionInfo = getCurrentCollectionInfo();

  const currentSortLabel =
    sortOptions.find((item) => item.value === sortBy)?.label || "Name";

  const mobileDropdownActiveClass = (isActive, orange = false) => {
    if (!isActive) {
      return "text-slate-700 hover:bg-slate-50";
    }

    return orange
      ? "bg-orange-50 text-orange-700"
      : "bg-indigo-50 text-indigo-700";
  };

  const MobileDropdown = ({
    dropdownKey,
    valueLabel,
    options,
    selectedValue,
    onSelect,
    disabled = false,
    disabledText = "Select first",
    orange = false,
  }) => {
    const isOpen = openMobileDropdown === dropdownKey;

    return (
      <div className="relative lg:hidden">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            setOpenMobileDropdown(isOpen ? "" : dropdownKey)
          }
          className={`w-full flex items-center justify-between gap-3 bg-slate-50 border rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none ${
            disabled
              ? "text-slate-400 border-slate-200 cursor-not-allowed"
              : orange
              ? "text-slate-700 border-orange-100 focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
              : "text-slate-700 border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
          }`}
        >
          <span className="truncate">
            {disabled ? disabledText : valueLabel}
          </span>

          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
            {options.map((option) => {
              const isActive = selectedValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    setOpenMobileDropdown("");
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-black border-b border-slate-50 last:border-b-0 transition-all ${mobileDropdownActiveClass(
                    isActive,
                    orange || option.value === "flashSale"
                  )}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const status = getStatus(product);
    const isOutOfStock = status.toLowerCase() === "out of stock";
    const allowSalePrice = isSaleEligibleProduct(product);
    const originalPrice = getOriginalPrice(product);
    const finalPrice = getFinalPrice(product, allowSalePrice);
    const hasDiscount = hasValidSalePrice(product, allowSalePrice);
    const discountPercent = getDiscountPercent(product, allowSalePrice);

    return (
      <div
        className={`group relative h-full bg-white rounded-[1.6rem] sm:rounded-[2rem] overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-2 flex flex-col ${
          isFlashCollection
            ? "border-orange-200 hover:shadow-2xl hover:shadow-orange-200/70"
            : "border-slate-100 hover:shadow-2xl hover:shadow-slate-200/80"
        }`}
      >
        {isFlashCollection && (
          <div className="absolute -top-14 -right-14 w-36 h-36 bg-orange-400/20 blur-3xl rounded-full pointer-events-none group-hover:bg-orange-400/35 transition-all duration-500" />
        )}

        <div
          className="relative cursor-pointer bg-slate-100 overflow-hidden"
          onClick={() => openProductDetails(product._id)}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-40 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />

          <div
            className={`absolute inset-0 ${
              isFlashCollection
                ? "bg-gradient-to-t from-orange-950/65 via-slate-950/15 to-transparent"
                : "bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-70"
            }`}
          />

          {hasDiscount && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-orange-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-all">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
              HOT DEAL
            </div>
          )}

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => handleWishlistClick(e, product)}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/90 hover:bg-white hover:scale-110 flex items-center justify-center shadow-lg backdrop-blur transition-all"
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  wishlist.find((item) => item._id === product._id)
                    ? "fill-red-500 text-red-500"
                    : "text-slate-700"
                }`}
              />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-sm transition-all group-hover:scale-105">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
              {Number(product.rating || 0).toFixed(1)}
            </div>

            {hasDiscount && (
              <div className="inline-flex items-center gap-1.5 bg-white/95 text-orange-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-sm transition-all group-hover:scale-105">
                <BadgePercent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Deal
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 relative flex flex-col flex-1">
          <button
            type="button"
            onClick={() => openProductDetails(product._id)}
            className="text-left w-full"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <h3
                className={`font-black text-base sm:text-lg leading-snug transition-colors line-clamp-1 ${
                  isFlashCollection
                    ? "text-slate-950 group-hover:text-orange-600"
                    : "text-slate-950 group-hover:text-indigo-700"
                }`}
              >
                {product.name || "Untitled Product"}
              </h3>

              <span
  className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black ${
    isOutOfStock
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600"
  }`}
>
  {isOutOfStock
    ? "Out"
    : Number(product.stock) > 0
    ? `${product.stock} left`
    : "In Stock"}
</span>
            </div>
          </button>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:1] sm:[-webkit-line-clamp:2] [-webkit-box-orient:vertical] min-h-[20px] sm:min-h-[44px]">
            {product.description ||
              product.details ||
              "Open this product to view complete information before ordering."}
          </p>

          <div className="mt-3 sm:mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-slate-400">
                {hasDiscount ? "Flash Sale Price" : "Price"}
              </p>

              <p
                className={`text-xl sm:text-2xl font-black transition-all group-hover:scale-[1.03] origin-left ${
                  hasDiscount ? "text-[#f57224]" : "text-slate-950"
                }`}
              >
                {hasDiscount && finalPrice === 0
                  ? "FREE"
                  : `NPR ${finalPrice.toLocaleString()}`}
              </p>

              {hasDiscount ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-slate-400 line-through font-bold">
                    NPR {originalPrice.toLocaleString()}
                  </p>

                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-emerald-600">
                    -{discountPercent}%
                  </span>
                </div>
              ) : (
                <div className="h-5 mt-1" />
              )}
            </div>

            <div className="text-right">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-slate-400">
                Reviews
              </p>

              <p className="text-sm font-black text-slate-700">
                {product.numReviews || product.reviews?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 sm:pt-5 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all hover:-translate-y-1 hover:scale-[1.02] ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isFlashCollection
                  ? "bg-orange-50 hover:bg-orange-100 text-orange-700"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Cart
            </button>

            <button
              type="button"
              onClick={() => handleBuyNow(product)}
              disabled={isOutOfStock}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all hover:-translate-y-1 hover:scale-[1.02] ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
              }`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        isFlashCollection
          ? "bg-gradient-to-br from-orange-50 via-white to-red-50"
          : "bg-[#F8FAFC]"
      }`}
    >
      <section
        className={`border-b ${
          isFlashCollection
            ? "relative overflow-hidden bg-gradient-to-br from-slate-950 via-orange-950 to-red-950 border-orange-900/30 text-white"
            : "bg-white border-slate-100"
        }`}
      >
        {isFlashCollection && (
          <>
            <div className="absolute -top-24 -right-20 w-80 h-80 bg-orange-500/25 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-red-500/20 blur-3xl rounded-full" />
            <Flame className="hidden lg:block absolute right-20 top-10 w-24 h-24 text-orange-300/20 fill-orange-300/20 animate-pulse" />
          </>
        )}

        <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div
                className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-4 ${
                  isFlashCollection
                    ? "bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}
              >
                {isFlashCollection ? (
                  <Flame className="w-4 h-4 fill-white" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                {currentCollectionInfo.label}
              </div>

              <h1
                className={`text-3xl sm:text-5xl font-black ${
                  isFlashCollection ? "text-white" : "text-slate-950"
                }`}
              >
                {currentCollectionInfo.title}
              </h1>

              <p
                className={`mt-2 max-w-2xl ${
                  isFlashCollection ? "text-orange-100/80" : "text-slate-500"
                }`}
              >
                {currentCollectionInfo.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div
                className={`border rounded-2xl px-4 py-3 text-center ${
                  isFlashCollection
                    ? "bg-white/10 border-white/10 backdrop-blur"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <p
                  className={`text-xl font-black ${
                    isFlashCollection ? "text-white" : "text-slate-950"
                  }`}
                >
                  {products.length}
                </p>
                <p
                  className={`text-[11px] font-black uppercase ${
                    isFlashCollection ? "text-orange-100/70" : "text-slate-400"
                  }`}
                >
                  Total
                </p>
              </div>

              <div
                className={`border rounded-2xl px-4 py-3 text-center ${
                  isFlashCollection
                    ? "bg-white/10 border-white/10 backdrop-blur"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <p className="text-xl font-black text-emerald-500">
                  {totalInStock}
                </p>
                <p
                  className={`text-[11px] font-black uppercase ${
                    isFlashCollection ? "text-orange-100/70" : "text-slate-400"
                  }`}
                >
                  Stock
                </p>
              </div>

              <div
                className={`border rounded-2xl px-4 py-3 text-center ${
                  isFlashCollection
                    ? "bg-white/10 border-white/10 backdrop-blur"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <p
                  className={`text-xl font-black ${
                    isFlashCollection ? "text-orange-300" : "text-indigo-600"
                  }`}
                >
                  {filteredProducts.length}
                </p>
                <p
                  className={`text-[11px] font-black uppercase ${
                    isFlashCollection ? "text-orange-100/70" : "text-slate-400"
                  }`}
                >
                  Result
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`border-b ${
          isFlashCollection
            ? "bg-transparent border-orange-100"
            : "bg-[#F8FAFC] border-slate-100"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div
            ref={filterPanelRef}
            className={`border rounded-[1.6rem] p-4 shadow-sm ${
              isFlashCollection
                ? "bg-white/90 border-orange-100 shadow-orange-100/60"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Search Product
                </label>

                <div className="relative" ref={searchBoxRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Type e for English, n for Nepali..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.trim() !== "") {
                        setShowSearchSuggestions(true);
                      }
                    }}
                    className={`w-full bg-slate-50 border rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                      isFlashCollection
                        ? "border-orange-100 focus:ring-orange-100 focus:border-orange-400"
                        : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
                    }`}
                  />

                  {showSearchSuggestions && searchTerm.trim() !== "" && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                      {searchSuggestions.length > 0 ? (
                        <>
                          <div className="border-b border-slate-100 px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                              Recommended Products
                            </p>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {searchSuggestions.map((product) => {
                              const allowSalePrice =
                                isFlashCollection ||
                                product?.flashSale === true;

                              return (
                                <button
                                  key={product._id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSearchTerm(product.name || "");
                                    setShowSearchSuggestions(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-slate-50 last:border-b-0 ${
                                    isFlashCollection
                                      ? "hover:bg-orange-50"
                                      : "hover:bg-indigo-50"
                                  }`}
                                >
                                  <ProductImage
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black text-slate-900 truncate">
                                      {product.name || "Untitled Product"}
                                    </p>

                                    <p className="text-xs font-bold text-slate-500 truncate">
                                      {getSuggestionLabel(product)}
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-[#f57224]">
                                      {getDisplayPriceText(
                                        product,
                                        allowSalePrice
                                      )}
                                    </p>

                                    <p className="text-[10px] font-black text-slate-400 uppercase">
                                      Select
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-5 text-center">
                          <p className="text-sm font-black text-slate-700">
                            No recommendations found
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Try English, Nepali, book name, category, or
                            subcategory.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Collections
                </label>

                <MobileDropdown
                  dropdownKey="collection"
                  valueLabel={currentCollectionInfo.label}
                  options={collectionOptions}
                  selectedValue={selectedCollection}
                  onSelect={handleCollectionSelect}
                  orange={isFlashCollection}
                />

                <select
                  value={selectedCollection}
                  onChange={(e) => handleCollectionSelect(e.target.value)}
                  className={`hidden lg:block w-full bg-slate-50 border rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 ${
                    isFlashCollection
                      ? "border-orange-100 focus:ring-orange-100 focus:border-orange-400"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
                  }`}
                >
                  {collectionOptions.map((collection) => (
                    <option key={collection.value} value={collection.value}>
                      {collection.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Category
                </label>

                <MobileDropdown
                  dropdownKey="category"
                  valueLabel={
                    selectedCategory === "all"
                      ? "All Categories"
                      : selectedCategory
                  }
                  options={[
                    {
                      value: "all",
                      label: "All Categories",
                    },
                    ...categories.map((category) => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                  selectedValue={selectedCategory}
                  onSelect={handleCategorySelect}
                  orange={isFlashCollection}
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className={`hidden lg:block w-full bg-slate-50 border rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 ${
                    isFlashCollection
                      ? "border-orange-100 focus:ring-orange-100 focus:border-orange-400"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
                  }`}
                >
                  <option value="all">All Categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Subcategory
                </label>

                <MobileDropdown
                  dropdownKey="subcategory"
                  valueLabel={
                    selectedSubcategory === "all"
                      ? "All Subcategories"
                      : selectedSubcategory
                  }
                  options={[
                    {
                      value: "all",
                      label: "All Subcategories",
                    },
                    ...subcategories.map((subcategory) => ({
                      value: subcategory,
                      label: subcategory,
                    })),
                  ]}
                  selectedValue={selectedSubcategory}
                  onSelect={(value) => {
                    setSelectedSubcategory(value);
                    setOpenMobileDropdown("");
                  }}
                  disabled={selectedCategory === "all"}
                  disabledText="Choose category first"
                  orange={isFlashCollection}
                />

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={selectedCategory === "all"}
                  className={`hidden lg:block w-full bg-slate-50 border rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 ${
                    isFlashCollection
                      ? "border-orange-100 focus:ring-orange-100 focus:border-orange-400"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
                  }`}
                >
                  <option value="all">All Subcategories</option>

                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Sort
                </label>

                <MobileDropdown
                  dropdownKey="sort"
                  valueLabel={currentSortLabel}
                  options={sortOptions}
                  selectedValue={sortBy}
                  onSelect={(value) => {
                    setSortBy(value);
                    setOpenMobileDropdown("");
                  }}
                  orange={isFlashCollection}
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`hidden lg:block w-full bg-slate-50 border rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 ${
                    isFlashCollection
                      ? "border-orange-100 focus:ring-orange-100 focus:border-orange-400"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
                  }`}
                >
                  {sortOptions.map((sortOption) => (
                    <option key={sortOption.value} value={sortOption.value}>
                      {sortOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <SlidersHorizontal
                  className={`w-4 h-4 ${
                    isFlashCollection ? "text-orange-500" : "text-indigo-600"
                  }`}
                />

                <span>
                  Showing{" "}
                  <span className="font-black text-slate-950">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-slate-950">
                    {products.length}
                  </span>{" "}
                  products
                </span>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all ${
                  isFlashCollection
                    ? "bg-orange-50 hover:bg-orange-100 text-orange-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="min-h-[420px] flex items-center justify-center">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 flex items-center gap-3">
              <Loader2
                className={`w-7 h-7 animate-spin ${
                  isFlashCollection ? "text-orange-500" : "text-indigo-600"
                }`}
              />

              <p className="font-black text-slate-600">Loading products...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-[2rem] p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />

            <div>
              <h3 className="font-black">Unable to load products</h3>

              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
            {isFlashCollection ? (
              <Flame className="w-12 h-12 text-orange-400 fill-orange-400 mx-auto mb-4" />
            ) : (
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            )}

            <h2 className="text-xl font-black text-slate-900">
              No products found
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your collection, category, subcategory, search, or
              sorting filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className={`mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                isFlashCollection
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-slate-950 hover:bg-indigo-700 text-white"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div
                  className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-3 ${
                    isFlashCollection
                      ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20"
                      : "bg-indigo-50 text-indigo-700 border-indigo-100"
                  }`}
                >
                  {isFlashCollection ? (
                    <Flame className="w-4 h-4 fill-white" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}

                  {currentCollectionInfo.label}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                  {currentCollectionInfo.title}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
                <PackageCheck className="w-5 h-5 text-emerald-600" />

                <span className="text-sm font-black text-slate-700">
                  {totalInStock} in stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}