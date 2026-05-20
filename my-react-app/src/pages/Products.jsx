import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ShoppingCart,
  AlertCircle,
  SlidersHorizontal,
  Filter,
  Star,
  Eye,
  Search,
  RotateCcw,
  BookOpen,
  PackageCheck,
  Grid3X3,
  Tags,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categoryOptions = {
  'Academic Books': [
    'School Books',
    'College Books',
    'Guide Books',
    'Question Banks',
  ],

  'Novels & Literature': [
    'Nepali Novels',
    'English Novels',
    'Self Help',
    'Biography',
    'Poetry',
    'Romance',
    'Mystery / Thriller',
    'History',
  ],

  "Children's Books": [
    'Story Books',
    'Comics',
    'Coloring Books',
    'Alphabet Books',
    'Activity Books',
    'Picture Books',
  ],

  'Religious Books': ['General Religious Books'],

  'Notebooks, Copies & Files': [
    'Single Line Copies',
    'Four Line Copies',
    'Drawing Copies',
    'Register Copies',
    'Practical Copies',
    'Diaries / Journals',
    'Files',
    'Folders',
  ],

  'Magazines & Newspapers': [
    'Newspapers',
    'Educational Magazines',
    'Monthly Magazines',
    'Comics Magazines',
    'Current Affairs Magazines',
  ],

  'Stationery Items': [
    'Pens',
    'Pencils',
    'Erasers',
    'Sharpeners',
    'Markers',
    'Highlighters',
    'Geometry Box',
    'Scales',
    'Art Supplies',
    'Office Supplies',
  ],
};

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = Object.keys(categoryOptions);

  const subcategories =
    selectedCategory === 'all'
      ? []
      : categoryOptions[selectedCategory] || [];

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/products')
      .then((res) => {
        setProducts(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error reading database array logs:', err);
        setError('Unable to process the store repository streams.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (product) => {
    return product.stockStatus || product.statusFlag || 'In Stock';
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('all');
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSortBy('name');
    setSearchTerm('');
  };

  const addToCart = (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to buy products.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        _id: product._id,
        title: product.name,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`"${product.name}" successfully added to your cart!`);
    navigate('/cart');
  };

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const totalInStock = products.filter(
    (product) => getStatus(product) === 'In Stock'
  ).length;

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === 'all' || product.category === selectedCategory;

    const subcategoryMatch =
      selectedSubcategory === 'all' ||
      product.subcategory === selectedSubcategory;

    const searchMatch =
      searchTerm.trim() === '' ||
      String(product.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(product.description || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(product.category || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(product.subcategory || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return categoryMatch && subcategoryMatch && searchMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);

    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-8">
        {/* Compact Catalog Header */}
        <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5">
                <BookOpen className="w-4 h-4" />
                Store Catalog
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-gray-950 leading-tight">
                Browse Our Products
              </h1>

              <p className="text-gray-500 mt-3 max-w-2xl leading-relaxed">
                Explore academic books, novels, children’s books, notebooks,
                magazines, newspapers, and stationery items from our live store
                inventory.
              </p>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-white">
              <div className="grid grid-cols-3 gap-3 h-full content-center">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                  <Grid3X3 className="w-5 h-5 text-indigo-100 mb-2" />
                  <p className="text-2xl font-black">{products.length}</p>
                  <p className="text-[11px] text-indigo-100 font-bold">
                    Products
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                  <Tags className="w-5 h-5 text-orange-200 mb-2" />
                  <p className="text-2xl font-black">{categories.length}</p>
                  <p className="text-[11px] text-indigo-100 font-bold">
                    Categories
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                  <PackageCheck className="w-5 h-5 text-emerald-200 mb-2" />
                  <p className="text-2xl font-black">{totalInStock}</p>
                  <p className="text-[11px] text-indigo-100 font-bold">
                    In Stock
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search / Toolbar */}
        {!loading && !error && (
          <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product name, category, or description..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="name">Sort: Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-3.5 rounded-2xl bg-gray-950 hover:bg-gray-800 text-white text-sm font-black flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-14 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-bold">
              Streaming real-time catalogs...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[2rem] text-red-700 flex items-start gap-3 max-w-2xl mx-auto shadow-sm p-6">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />

            <div>
              <h4 className="font-black text-base">
                Cluster Synchronization Timeout
              </h4>
              <p className="text-sm text-red-600/90 mt-1">
                Please verify if your backend server is running on port 5000.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 sticky top-24 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                      Filter Panel
                    </p>
                    <h3 className="font-black text-gray-950">Categories</h3>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                    Main Category
                  </h4>

                  <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>All Products</span>
                        <span className="text-xs opacity-80">
                          {products.length}
                        </span>
                      </div>
                    </button>

                    {categories.map((category) => {
                      const count = products.filter(
                        (product) => product.category === category
                      ).length;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            selectedCategory === category
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{category}</span>
                            <span className="text-xs opacity-80">{count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedCategory !== 'all' && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                      Subcategory
                    </h4>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSubcategory('all')}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          selectedSubcategory === 'all'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                        }`}
                      >
                        All Subcategories
                      </button>

                      {subcategories.map((subcategory) => (
                        <button
                          key={subcategory}
                          type="button"
                          onClick={() => setSelectedSubcategory(subcategory)}
                          className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            selectedSubcategory === subcategory
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                          }`}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Product Results */}
            <main className="lg:col-span-9 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    Catalog Results
                  </p>

                  <h2 className="text-2xl font-black text-gray-950 mt-1">
                    {filteredProducts.length} Products Found
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm w-fit">
                  <Filter className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-500">
                    Current:{' '}
                    <span className="font-black text-gray-800">
                      {selectedCategory === 'all'
                        ? 'All Products'
                        : selectedCategory}
                    </span>
                  </p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 p-8 max-w-md mx-auto shadow-sm">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-black text-gray-400">
                    Our stock shelves are temporarily empty.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add items from the Admin Panel's Manage Books route.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 p-8 max-w-md mx-auto shadow-sm">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-black text-gray-400">
                    No products found for this filter.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-5 py-3 bg-orange-500 text-white rounded-2xl text-sm font-black hover:bg-orange-600"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const status = getStatus(product);
                    const isOutOfStock = status === 'Out of Stock';

                    return (
                      <div
                        key={product._id}
                        className="group bg-white border border-gray-100 rounded-[1.7rem] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                      >
                        {/* Product Image */}
                        <button
                          type="button"
                          onClick={() => openProductDetails(product._id)}
                          className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden text-left"
                        >
                          <img
                            src={
                              product.image ||
                              'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'
                            }
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                            <span className="bg-white/95 backdrop-blur-md text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm max-w-[70%] truncate">
                              {product.category || 'General'}
                            </span>

                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                isOutOfStock
                                  ? 'bg-red-600 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </button>

                        {/* Product Content */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                              {product.subcategory || 'General'}
                            </span>

                            <button
                              type="button"
                              onClick={() => openProductDetails(product._id)}
                              className="text-left w-full"
                            >
                              <h4 className="font-black text-gray-950 text-base tracking-tight line-clamp-1 hover:text-indigo-600 transition-colors pt-2">
                                {product.name}
                              </h4>
                            </button>

                            <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">
                              {product.description ||
                                'No descriptive overview details added for this product.'}
                            </p>

                            <div className="flex items-center gap-1 mt-3">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-sm font-black text-gray-800">
                                {Number(product.rating || 0).toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({product.numReviews || 0} reviews)
                              </span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                                  Price
                                </p>
                                <span className="text-xl font-black text-slate-950 tracking-tight">
                                  NPR{' '}
                                  {Number(product.price || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => openProductDetails(product._id)}
                                className="flex items-center justify-center gap-1 px-3 py-3 rounded-2xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>

                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => addToCart(product)}
                                className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-black transition-all shadow-sm ${
                                  isOutOfStock
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white cursor-pointer'
                                }`}
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Buy
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}