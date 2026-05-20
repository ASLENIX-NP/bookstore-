import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  BookOpen,
  Trash2,
  Layers,
  AlertCircle,
  Upload,
} from 'lucide-react';

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

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic Books',
    subcategory: 'School Books',
    price: '',
    stockStatus: 'In Stock',
    description: '',
    image: '',
  });

  const categories = Object.keys(categoryOptions);
  const subcategories = categoryOptions[formData.category] || [];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large! Please select an image under 2MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.onerror = (err) => {
      console.error('Error reading file stream:', err);
    };
  };

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setBooks(res.data);
      setError(null);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to reach backend cluster API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Academic Books',
      subcategory: 'School Books',
      price: '',
      stockStatus: 'In Stock',
      description: '',
      image: '',
    });

    const fileInput = document.getElementById('bookImageInput');
    if (fileInput) fileInput.value = '';
  };

  const handleCategoryChange = (selectedCategory) => {
    const firstSubcategory = categoryOptions[selectedCategory]?.[0] || 'General';

    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory: firstSubcategory,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category || !formData.subcategory) {
      alert('Please complete all required fields.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/products', {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        price: Number(formData.price),
        stockStatus: formData.stockStatus,
        statusFlag: formData.stockStatus,
        description: formData.description || 'No description provided',
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
      });

      if (res.data) {
        setBooks((prev) => [res.data, ...prev]);
        resetForm();
        alert('Product saved and synced successfully!');
        setError(null);
      }
    } catch (err) {
      console.error('Error creating product:', err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to create new item. Check your backend logs.'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setBooks((prev) => prev.filter((book) => book._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item.');
    }
  };

  const handleToggleStock = async (book) => {
    const currentStatus = book.stockStatus || book.statusFlag || 'In Stock';
    const newStatus = currentStatus === 'In Stock' ? 'Out of Stock' : 'In Stock';

    try {
      const res = await axios.patch(`http://localhost:5000/api/products/${book._id}`, {
        stockStatus: newStatus,
      });

      setBooks((prev) =>
        prev.map((item) => (item._id === book._id ? res.data : item))
      );
    } catch (err) {
      console.error('Error updating stock status:', err);
      alert('Failed to update stock status.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-orange-500 w-6 h-6 shrink-0" />
            Inventory Management Hub
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage products, categories, stock flags, and custom covers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Add Product Form */}
        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <PlusCircle className="w-4 h-4 text-orange-500" />
            Add New Product
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Example: Mathematics Grade 10"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white text-gray-700 font-medium"
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
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-bold text-gray-600 cursor-pointer"
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
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-bold text-gray-600 cursor-pointer"
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
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-bold text-gray-600 cursor-pointer"
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
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                placeholder="650"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none text-gray-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Upload Product Cover Image
              </label>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />

                  <p className="text-[11px] text-gray-500 font-medium text-center">
                    {formData.image ? (
                      <span className="text-emerald-600 font-bold">
                        ✓ Image Ready
                      </span>
                    ) : (
                      'Click to select local file'
                    )}
                  </p>
                </div>

                <input
                  id="bookImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Short Description
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Write short product description..."
                rows="3"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none text-gray-700 font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Save Into Catalog
            </button>
          </form>
        </section>

        {/* Inventory List */}
        <section className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Currently Active Items ({books.length})
          </h3>

          {loading && (
            <div className="p-12 text-center text-sm text-gray-400 animate-pulse">
              Syncing data stream...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && books.length === 0 ? (
            <p className="text-xs font-medium text-gray-400 bg-gray-50 p-8 rounded-xl text-center border border-dashed border-gray-200">
              No active inventory items found.
            </p>
          ) : null}

          {/* Mobile Card View */}
          {!loading && !error && books.length > 0 && (
            <div className="md:hidden space-y-3">
              {books.map((book) => {
                const status = book.stockStatus || book.statusFlag || 'In Stock';

                return (
                  <div
                    key={book._id}
                    className="border border-gray-100 rounded-xl p-3 bg-slate-50"
                  >
                    <div className="flex gap-3">
                      <img
                        src={book.image}
                        alt={book.name}
                        className="w-14 h-20 object-cover rounded shadow-sm bg-gray-50 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm">
                          {book.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {book.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {book.category}
                          </span>

                          <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {book.subcategory}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              status === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="font-bold text-slate-800">
                            NPR {book.price}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStock(book)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                status === 'In Stock'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {status === 'In Stock' ? 'Mark Out' : 'Mark In'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(book._id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Table View */}
          {!loading && !error && books.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Product Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subcategory</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs text-gray-600 font-medium">
                  {books.map((book) => {
                    const status =
                      book.stockStatus || book.statusFlag || 'In Stock';

                    return (
                      <tr
                        key={book._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.image}
                              alt={book.name}
                              className="w-7 h-10 object-cover rounded shadow-sm bg-gray-50 shrink-0"
                            />

                            <div>
                              <p className="font-bold text-gray-900">
                                {book.name}
                              </p>
                              <p className="text-[10px] text-gray-400 max-w-xs truncate">
                                {book.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {book.category}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {book.subcategory || 'General'}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-800">
                          NPR {book.price}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              status === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStock(book)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                                status === 'In Stock'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {status === 'In Stock' ? 'Mark Out' : 'Mark In'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(book._id)}
                              className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}