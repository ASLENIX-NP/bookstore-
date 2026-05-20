import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ShoppingCart,
  AlertCircle,
  Bookmark,
  SlidersHorizontal,
  Filter,
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

  'Religious Books': [
    'General Religious Books',
  ],

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

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === 'all' || product.category === selectedCategory;

    const subcategoryMatch =
      selectedSubcategory === 'all' ||
      product.subcategory === selectedSubcategory;

    return categoryMatch && subcategoryMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);

    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Bookmark className="text-orange-500 w-7 h-7" />
          Discover Our Catalog
        </h2>

        <p className="text-sm text-gray-500 mt-1.5">
          Browse books, magazines, notebooks, files, and stationery items.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          <p className="text-xs text-gray-400 font-semibold">
            Streaming real-time catalogs...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-3 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

          <div>
            <h4 className="font-bold text-sm">
              Cluster Synchronization Timeout
            </h4>
            <p className="text-xs text-red-600/90 mt-1">
              Please verify if your backend server is running on port 5000.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-900">Filters</h3>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Main Category
                </h4>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    All Products ({products.length})
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
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          selectedCategory === category
                            ? 'bg-orange-500 text-white'
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Subcategory
                  </h4>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        selectedSubcategory === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>

                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          selectedSubcategory === subcategory
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Sort
                </h4>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 focus:outline-none"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Products */}
          <main className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-bold text-gray-900">
                  {filteredProducts.length}
                </span>{' '}
                products
              </p>

              <p className="text-xs text-gray-400">
                Category:{' '}
                <span className="font-semibold text-gray-600">
                  {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                </span>
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 p-8 max-w-md mx-auto">
                <p className="text-sm font-bold text-gray-400">
                  Our stock shelves are temporarily empty.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Add items from the Admin Panel's Manage Books route.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 p-8 max-w-md mx-auto">
                <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">
                  No products found for this filter.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600"
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
                      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden border-b border-gray-50">
                        <img
                          src={
                            product.image ||
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                              {product.category || 'General'}
                            </span>

                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {product.subcategory || 'General'}
                            </span>
                          </div>

                          <h4 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors pt-1">
                            {product.name}
                          </h4>

                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                            {product.description ||
                              'No descriptive overview details added for this product.'}
                          </p>
                        </div>

                        {/* Price + Cart */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            NPR {Number(product.price || 0).toLocaleString()}
                          </span>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(product)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm cursor-pointer'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Buy
                          </button>
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
  );
}