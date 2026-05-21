import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PlusCircle,
  BookOpen,
  Trash2,
  Layers,
  AlertCircle,
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

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic Books',
    subcategory: 'School Books',
    price: '',
    salePrice: '',
    stockStatus: 'In Stock',
    description: '',
    image: '',

    featured: false,
    flashSale: false,
    bestSeller: false,
    newArrival: false,
  });

  const categories = Object.keys(categoryOptions);
  const subcategories =
    categoryOptions[formData.category] || [];

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        'http://localhost:5000/api/products'
      );

      setBooks(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCategoryChange = (selectedCategory) => {
    const firstSubcategory =
      categoryOptions[selectedCategory]?.[0] ||
      'General';

    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory: firstSubcategory,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'http://localhost:5000/api/products',
        {
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory,

          price: Number(formData.price),

          salePrice: Number(
            formData.salePrice || 0
          ),

          featured: formData.featured,
          flashSale: formData.flashSale,
          bestSeller: formData.bestSeller,
          newArrival: formData.newArrival,

          stockStatus: formData.stockStatus,

          description:
            formData.description ||
            'No description provided',

          image:
            formData.image ||
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
        }
      );

      setBooks((prev) => [res.data, ...prev]);

      setFormData({
        name: '',
        category: 'Academic Books',
        subcategory: 'School Books',
        price: '',
        salePrice: '',
        stockStatus: 'In Stock',
        description: '',
        image: '',

        featured: false,
        flashSale: false,
        bestSeller: false,
        newArrival: false,
      });

      alert('Product added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create product.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );

      setBooks((prev) =>
        prev.filter((book) => book._id !== id)
      );
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleToggleStock = async (book) => {
    const newStatus =
      book.stockStatus === 'In Stock'
        ? 'Out of Stock'
        : 'In Stock';

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/products/${book._id}`,
        {
          stockStatus: newStatus,
        }
      );

      setBooks((prev) =>
        prev.map((item) =>
          item._id === book._id ? res.data : item
        )
      );
    } catch (err) {
      console.error(err);
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
          Manage products, categories, stock
          flags, and custom covers.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

        {/* LEFT SIDE */}

        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">

          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <PlusCircle className="w-4 h-4 text-orange-500" />
            Add New Product
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

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
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
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
                      stockStatus:
                        e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="In Stock">
                    In Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>
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
                    subcategory:
                      e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {subcategories.map(
                  (subcategory) => (
                    <option
                      key={subcategory}
                      value={subcategory}
                    >
                      {subcategory}
                    </option>
                  )
                )}
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
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Sale Price (Optional)
              </label>

              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice:
                      e.target.value,
                  })
                }
                placeholder="499"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured:
                        e.target.checked,
                    })
                  }
                />

                Featured Product
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.flashSale}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flashSale:
                        e.target.checked,
                    })
                  }
                />

                Flash Sale
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.bestSeller}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bestSeller:
                        e.target.checked,
                    })
                  }
                />

                Best Seller
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.newArrival}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newArrival:
                        e.target.checked,
                    })
                  }
                />

                New Arrival
              </label>

            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              Save Into Catalog
            </button>

          </form>

        </section>

        {/* RIGHT SIDE */}

        <section className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">

          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Currently Active Items ({books.length})
            </h3>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">
              Loading inventory...
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          ) : books.length === 0 ? (
            <div className="text-sm text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left text-gray-400 uppercase text-[11px] tracking-wider border-b border-gray-100">
                    <th className="pb-3">
                      Product Details
                    </th>

                    <th className="pb-3">
                      Category
                    </th>

                    <th className="pb-3">
                      Subcategory
                    </th>

                    <th className="pb-3">
                      Price
                    </th>

                    <th className="pb-3">
                      Status
                    </th>

                    <th className="pb-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {books.map((book) => (
                    <tr
                      key={book._id}
                      className="border-b border-gray-50"
                    >

                      <td className="py-4">

                        <div className="flex items-center gap-3">

                          <img
                            src={book.image}
                            alt={book.name}
                            className="w-12 h-14 rounded-lg object-cover border border-gray-100"
                          />

                          <div>

                            <h4 className="font-semibold text-gray-800 text-sm">
                              {book.name}
                            </h4>

                            <div className="flex flex-wrap gap-1 mt-1">

                              {book.featured && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                  Featured
                                </span>
                              )}

                              {book.flashSale && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                  Flash Sale
                                </span>
                              )}

                              {book.bestSeller && (
                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                  Best Seller
                                </span>
                              )}

                              {book.newArrival && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                  New Arrival
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                      </td>

                      <td className="py-4">
                        {book.category}
                      </td>

                      <td className="py-4">
                        {book.subcategory}
                      </td>

                      <td className="py-4 font-bold text-gray-800">
                        NPR {book.price}
                      </td>

                      <td className="py-4">

                        <span
                          className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                            book.stockStatus ===
                            'In Stock'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {book.stockStatus}
                        </span>

                      </td>

                      <td className="py-4">

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              handleToggleStock(
                                book
                              )
                            }
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
                          >
                            {book.stockStatus ===
                            'In Stock'
                              ? 'Mark Out'
                              : 'Mark In'}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                book._id
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}