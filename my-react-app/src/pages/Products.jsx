import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  AlertCircle,
  Star,
  Eye,
  Search,
  RotateCcw,
  BookOpen,
  PackageCheck,
  Grid3X3,
  SlidersHorizontal,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const CART_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500";

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  if (String(image).startsWith("data:image")) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
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

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = Object.keys(categoryOptions);

  const subcategories =
    selectedCategory === "all" ? [] : categoryOptions[selectedCategory] || [];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please make sure backend is running.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (product) => {
    return product.stockStatus || product.statusFlag || "In Stock";
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("all");
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSortBy("name");
    setSearchTerm("");
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

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: Number(product.price || 0),
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

    const buyNowProduct = [
      {
        _id: product._id,
        productId: product._id,
        title: product.name,
        name: product.name,
        price: Number(product.price || 0),
        image: getSafeCartImage(product.image),
        quantity: 1,
        subtotal: Number(product.price || 0),
      },
    ];

    localStorage.setItem("checkoutItems", JSON.stringify(buyNowProduct));
    localStorage.setItem("checkoutType", "Buy Now");

    navigate("/checkout/delivery");
  };

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
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

    const searchMatch =
      searchTerm.trim() === "" ||
      String(product.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return categoryMatch && subcategoryMatch && searchMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return Number(a.price || 0) - Number(b.price || 0);
    }

    if (sortBy === "price-high") {
      return Number(b.price || 0) - Number(a.price || 0);
    }

    if (sortBy === "rating") {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }

    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }

    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  const ProductCard = ({ product }) => {
    const status = getStatus(product);
    const isOutOfStock = status.toLowerCase() === "out of stock";

    return (
      <div className="group bg-white rounded-[1.6rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300">
        <div
          className="relative bg-slate-100 cursor-pointer overflow-hidden"
          onClick={() => openProductDetails(product._id)}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-75" />

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black border backdrop-blur ${
                  isOutOfStock
                    ? "bg-red-50/95 text-red-600 border-red-100"
                    : "bg-emerald-50/95 text-emerald-600 border-emerald-100"
                }`}
              >
                {status}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openProductDetails(product._id);
              }}
              className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-black shadow-sm">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              {Number(product.rating || 0).toFixed(1)}
            </div>

            {product.category && (
              <span className="text-[11px] font-black bg-slate-950/80 text-white px-3 py-1.5 rounded-full border border-white/10 backdrop-blur">
                {product.category}
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <button
            type="button"
            onClick={() => openProductDetails(product._id)}
            className="text-left w-full"
          >
            <h3 className="font-black text-slate-950 text-lg leading-snug group-hover:text-indigo-700 transition-colors">
              {product.name || "Untitled Product"}
            </h3>
          </button>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] min-h-[44px]">
            {product.description ||
              product.details ||
              "Open this product to view complete information before ordering."}
          </p>

          <div className="mt-4 flex items-end justify-between gap-4">
  <div>
    {/* SHOW SALE LABEL ONLY IF SALE EXISTS */}

    {product.salePrice &&
    Number(product.salePrice) < Number(product.price) ? (
      <>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Flash Sale Price
        </p>

        {/* SALE PRICE */}

        <p className="text-2xl font-black text-[#f57224]">
          NPR{" "}
          {Number(product.salePrice || 0).toLocaleString()}
        </p>

        {/* ORIGINAL PRICE + DISCOUNT */}

        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-slate-400 line-through font-bold">
            NPR {Number(product.price || 0).toLocaleString()}
          </p>

          <span className="text-xs font-black text-emerald-600">
            -
            {Math.round(
              ((Number(product.price || 0) -
                Number(product.salePrice || 0)) /
                Number(product.price || 1)) *
                100
            )}
            %
          </span>
        </div>
      </>
    ) : (
      <>
        {/* NORMAL PRICE */}

        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Product Price
        </p>

        <p className="text-2xl font-black text-slate-900">
          NPR {Number(product.price || 0).toLocaleString()}
        </p>
      </>
    )}
  </div>

  <div className="text-right">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
      Reviews
    </p>

    <p className="text-sm font-black text-slate-700">
      {product.numReviews || product.reviews?.length || 0}
    </p>
  </div>
</div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 text-sm font-black transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
            </button>

            <button
              type="button"
              onClick={() => handleBuyNow(product)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-indigo-700 text-white px-4 py-3 text-sm font-black shadow-md transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-4">
                <BookOpen className="w-4 h-4" />
                Products
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
                Shop Products
              </h1>

              <p className="text-slate-500 mt-2 max-w-2xl">
                Browse books, newspapers, magazines, stationery, and learning
                essentials.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-xl font-black text-slate-950">
                  {products.length}
                </p>
                <p className="text-[11px] font-black text-slate-400 uppercase">
                  Total
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-xl font-black text-emerald-600">
                  {totalInStock}
                </p>
                <p className="text-[11px] font-black text-slate-400 uppercase">
                  Stock
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-center">
                <p className="text-xl font-black text-indigo-600">
                  {filteredProducts.length}
                </p>
                <p className="text-[11px] font-black text-slate-400 uppercase">
                  Result
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="bg-white border border-slate-100 rounded-[1.6rem] p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Search Product
                </label>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Subcategory
                </label>

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={selectedCategory === "all"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
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

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400"
                >
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price Low</option>
                  <option value="price-high">Price High</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
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
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl text-sm font-black transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="min-h-[420px] flex items-center justify-center">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 flex items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
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
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />

            <h2 className="text-xl font-black text-slate-900">
              No products found
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your category, subcategory, search, or sorting
              filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all"
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
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-3">
                  <Grid3X3 className="w-4 h-4" />
                  Product List
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                  Available Products
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-black text-slate-700">
                  {totalInStock} in stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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