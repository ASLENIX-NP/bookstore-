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

const CART_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';

const getSafeCartImage = (image) => {
  if (!image) return CART_IMAGE_PLACEHOLDER;

  // Do not store huge base64 images in localStorage cart/checkout data
  if (String(image).startsWith('data:image')) {
    return CART_IMAGE_PLACEHOLDER;
  }

  return image;
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

  // ADD TO CART
  const addToCart = (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to add products to cart.');
      navigate('/login', { state: { from: '/products' } });
      return;
    }

    const currentCart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const existingItem = currentCart.find(
      (item) => item._id === product._id
    );

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

    localStorage.setItem('cart', JSON.stringify(currentCart));

    alert(`${product.name} added to cart`);
  };

  const handleBuyNow = (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first to buy products.');
      navigate('/login', { state: { from: '/products' } });
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

    localStorage.setItem(
      'checkoutItems',
      JSON.stringify(buyNowProduct)
    );

    localStorage.setItem('checkoutType', 'Buy Now');

    navigate('/checkout/delivery');
  };

  const openProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const totalInStock = products.filter(
    (product) => getStatus(product) === 'In Stock'
  ).length;

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === 'all' ||
      product.category === selectedCategory;

    const subcategoryMatch =
      selectedSubcategory === 'all' ||
      product.subcategory === selectedSubcategory;

    const searchMatch =
      searchTerm.trim() === '' ||
      String(product.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return categoryMatch && subcategoryMatch && searchMatch;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low')
      return Number(a.price) - Number(b.price);

    if (sortBy === 'price-high')
      return Number(b.price) - Number(a.price);

    return String(a.name || '').localeCompare(
      String(b.name || '')
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-8">

        {/* HEADER */}
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
                Explore academic books, novels, notebooks and stationery items.
              </p>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-8 text-white">
              <div className="grid grid-cols-3 gap-3 h-full content-center">

                <div className="bg-white/10 rounded-2xl p-4">
                  <Grid3X3 className="w-5 h-5 mb-2" />
                  <p className="text-2xl font-black">
                    {products.length}
                  </p>
                  <p className="text-[11px] font-bold">
                    Products
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <Tags className="w-5 h-5 mb-2" />
                  <p className="text-2xl font-black">
                    {categories.length}
                  </p>
                  <p className="text-[11px] font-bold">
                    Categories
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <PackageCheck className="w-5 h-5 mb-2" />
                  <p className="text-2xl font-black">
                    {totalInStock}
                  </p>
                  <p className="text-[11px] font-bold">
                    In Stock
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search products..."
                className="w-full bg-slate-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-3 rounded-2xl bg-black text-white text-sm font-black"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Reset
            </button>

          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-sm font-black text-gray-500">
              Loading products...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[2rem] text-red-700 flex items-start gap-3 shadow-sm p-6">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />

            <div>
              <h4 className="font-black text-base">
                Product Loading Error
              </h4>
              <p className="text-sm text-red-600/90 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredProducts.map((product) => {

              const status = getStatus(product);

              const isOutOfStock =
                status === 'Out of Stock';

              return (
                <div
                  key={product._id}
                  className="group bg-white border border-gray-100 rounded-[1.7rem] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                >

                  {/* IMAGE */}
                  <button
                    type="button"
                    onClick={() =>
                      openProductDetails(product._id)
                    }
                    className="relative aspect-[3/4] w-full overflow-hidden"
                  >
                    <img
                      src={
                        product.image ||
                        CART_IMAGE_PLACEHOLDER
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">
                        {product.category || 'General'}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          isOutOfStock
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </button>

                  {/* CONTENT */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                        {product.subcategory || 'General'}
                      </span>

                      <h4 className="font-black text-gray-950 text-base pt-2">
                        {product.name}
                      </h4>

                      <p
                        className="text-sm text-gray-500 mt-2 leading-relaxed min-h-[40px]"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description || 'No description provided'}
                      </p>

                      <div className="flex items-center gap-1 mt-3">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />

                        <span className="text-sm font-black">
                          {Number(
                            product.rating || 0
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="pt-4 border-t border-gray-100">

                      <p className="text-[10px] uppercase font-black text-gray-400">
                        Price
                      </p>

                      <span className="text-xl font-black text-slate-950">
                        NPR{' '}
                        {Number(
                          product.price || 0
                        ).toLocaleString()}
                      </span>

                      {/* BUTTONS */}
                      <div className="flex items-center gap-2 mt-4">

                        {/* DETAILS */}
                        <button
                          type="button"
                          onClick={() =>
                            openProductDetails(product._id)
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>

                        {/* ADD TO CART */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-black transition-all ${
                            isOutOfStock
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Cart
                        </button>

                        {/* BUY NOW */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleBuyNow(product)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-black transition-all ${
                            isOutOfStock
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
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
      </div>
    </div>
  );
}