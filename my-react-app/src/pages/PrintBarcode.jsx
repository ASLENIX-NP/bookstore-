import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Barcode from "react-barcode";
import toast from "react-hot-toast";
import {
  Printer,
  Barcode as BarcodeIcon,
  Search,
  RotateCcw,
  Layers,
  PackageCheck,
  AlertCircle,
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

export default function PrintBarcode() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [printQuantity, setPrintQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = Object.keys(categoryOptions);

  const subcategories =
    selectedCategory === "all"
      ? []
      : categoryOptions[selectedCategory] || [];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:5000/api/products");

      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data.products || response.data.data || [];

      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductBarcode = (product) => {
    return product?.barcode || product?.sku || "";
  };

  const getProductStock = (product) => {
    return Number(product?.stock ?? product?.quantity ?? 0);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category === selectedCategory;

      const subcategoryMatch =
        selectedSubcategory === "all" ||
        product.subcategory === selectedSubcategory;

      const searchMatch =
        searchTerm.trim() === "" ||
        String(product.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(product.barcode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(product.sku || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return categoryMatch && subcategoryMatch && searchMatch;
    });
  }, [products, selectedCategory, selectedSubcategory, searchTerm]);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product._id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const barcodeLabels = useMemo(() => {
    if (!selectedProduct) return [];

    const count = Math.max(1, Number(printQuantity || 1));

    return Array.from({ length: count }, (_, index) => ({
      id: `${selectedProduct._id}-${index}`,
      product: selectedProduct,
    }));
  }, [selectedProduct, printQuantity]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("all");
    setSelectedProductId("");
    setPrintQuantity(1);
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedProductId("");
    setPrintQuantity(1);
  };

  const handleProductChange = (productId) => {
    setSelectedProductId(productId);

    const product = products.find((item) => item._id === productId);

    if (product) {
      const stock = getProductStock(product);
      setPrintQuantity(stock > 0 ? stock : 1);
    } else {
      setPrintQuantity(1);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedProductId("");
    setPrintQuantity(1);
    setSearchTerm("");
  };

  const handlePrint = () => {
    if (!selectedProduct) {
      toast.error("Please select a product first.");
      return;
    }

    if (!getProductBarcode(selectedProduct)) {
      toast.error("This product has no barcode or SKU.");
      return;
    }

    if (Number(printQuantity) <= 0) {
      toast.error("Print quantity must be at least 1.");
      return;
    }

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            nav,
            header,
            aside,
            .no-print {
              display: none !important;
            }

            main {
              padding: 0 !important;
              margin: 0 !important;
            }

            .print-area {
              display: block !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }

            .barcode-grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 8mm !important;
            }

            .barcode-label {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              border: 1px solid #111 !important;
              border-radius: 8px !important;
              padding: 8px !important;
              min-height: 42mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }

            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}
      </style>

      <div className="no-print space-y-6">
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.18em] mb-4">
                <BarcodeIcon className="w-4 h-4" />
                Print Barcode
              </div>

              <h1 className="text-3xl font-black text-slate-950">
                Product Barcode Printing
              </h1>

              <p className="text-slate-500 mt-2">
                Select category, subcategory, product, and print barcode labels
                according to stock quantity.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!selectedProduct || !getProductBarcode(selectedProduct)}
              className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                selectedProduct && getProductBarcode(selectedProduct)
                  ? "bg-slate-950 hover:bg-indigo-700 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Printer className="w-5 h-5" />
              Print Labels
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={selectedCategory === "all"}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">All Subcategories</option>

                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                Product
              </label>

              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Select Product</option>

                {filteredProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} | Stock: {getProductStock(product)} |{" "}
                    {getProductBarcode(product) || "No Barcode"}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                Print Quantity
              </label>

              <input
                type="number"
                min="1"
                value={printQuantity}
                onChange={(e) => setPrintQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-10 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product by name, barcode, or SKU..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-4 rounded-2xl text-sm font-black transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 text-center">
            <p className="font-black text-slate-500">Loading products...</p>
          </div>
        ) : selectedProduct ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="font-black text-slate-950">Selected Product</h2>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-black text-slate-900">Name:</span>{" "}
                  {selectedProduct.name}
                </p>

                <p>
                  <span className="font-black text-slate-900">Category:</span>{" "}
                  {selectedProduct.category || "N/A"}
                </p>

                <p>
                  <span className="font-black text-slate-900">
                    Subcategory:
                  </span>{" "}
                  {selectedProduct.subcategory || "N/A"}
                </p>

                <p>
                  <span className="font-black text-slate-900">Price:</span> NPR{" "}
                  {Number(selectedProduct.price || 0).toLocaleString()}
                </p>

                <p>
                  <span className="font-black text-slate-900">Stock:</span>{" "}
                  {getProductStock(selectedProduct)}
                </p>

                <p>
                  <span className="font-black text-slate-900">Barcode:</span>{" "}
                  {getProductBarcode(selectedProduct) || "Not Added"}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-slate-950">Barcode Preview</h2>
              </div>

              {getProductBarcode(selectedProduct) ? (
                <div className="border border-slate-200 rounded-2xl p-5 inline-block bg-white">
                  <Barcode
                    value={String(getProductBarcode(selectedProduct))}
                    width={1.4}
                    height={55}
                    fontSize={12}
                    margin={6}
                  />

                  <p className="text-center text-xs font-black text-slate-800 mt-1">
                    {selectedProduct.name}
                  </p>

                  <p className="text-center text-xs font-bold text-slate-500">
                    NPR {Number(selectedProduct.price || 0).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

                  <div>
                    <p className="font-black text-red-700">
                      This product has no barcode.
                    </p>

                    <p className="text-sm text-red-500 mt-1">
                      Add barcode or SKU from Manage Books first.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
            <BarcodeIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />

            <p className="font-black text-slate-900">No product selected</p>

            <p className="text-sm text-slate-500 mt-1">
              Select category, subcategory, and product to generate barcode
              labels.
            </p>
          </div>
        )}
      </div>

      <div className="print-area hidden print:block">
        {selectedProduct && getProductBarcode(selectedProduct) && (
          <div className="barcode-grid">
            {barcodeLabels.map((label) => (
              <div key={label.id} className="barcode-label">
                <p className="text-[11px] font-black text-center mb-1">
                  PatraPatrika Center
                </p>

                <Barcode
                  value={String(getProductBarcode(label.product))}
                  width={1.2}
                  height={42}
                  fontSize={10}
                  margin={4}
                />

                <p className="text-[10px] font-black text-center mt-1 leading-tight">
                  {label.product.name}
                </p>

                <p className="text-[10px] font-bold text-center">
                  NPR {Number(label.product.price || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}