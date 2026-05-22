import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PlusCircle,
  Layers,
  Trash2,
  BookOpen,
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

  "Religious Books": [
    "General Religious Books",
  ],

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

export default function ManageBooks() {
  const [books, setBooks] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "Academic Books",
    subcategory: "School Books",
    price: "",
    salePrice: "",
    stockStatus: "In Stock",

    description: "",

    featured: false,
    flashSale: false,
    bestSeller: false,
    newArrival: false,
  });

  const categories = Object.keys(categoryOptions);

  const subcategories =
    categoryOptions[formData.category] || [];

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setBooks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCategoryChange = (
    selectedCategory
  ) => {
    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory:
        categoryOptions[selectedCategory][0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products",
        {
          ...formData,
        }
      );

      setBooks([
        response.data,
        ...books,
      ]);

      setFormData({
        name: "",
        category: "Academic Books",
        subcategory: "School Books",
        price: "",
        salePrice: "",
        stockStatus: "In Stock",

        description: "",

        featured: false,
        flashSale: false,
        bestSeller: false,
        newArrival: false,
      });

      alert("Product added successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${id}`
      );

      setBooks(
        books.filter(
          (book) => book._id !== id
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStock = async (
    product
  ) => {
    try {
      const updatedStatus =
        product.stockStatus === "In Stock"
          ? "Out of Stock"
          : "In Stock";

      const response = await axios.patch(
        `http://localhost:5000/api/products/${product._id}`,
        {
          stockStatus: updatedStatus,
        }
      );

      setBooks(
        books.map((book) =>
          book._id === product._id
            ? response.data
            : book
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* HEADER */}

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="text-orange-500 w-6 h-6 shrink-0" />

          Inventory Management Hub
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage products, categories,
          stock flags, and custom covers.
        </p>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

        {/* LEFT FORM */}

        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">

          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <PlusCircle className="w-4 h-4 text-orange-500" />

            Add New Product
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* PRODUCT NAME */}

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

            {/* CATEGORY + STOCK */}

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
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
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

            {/* SUBCATEGORY */}

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

            {/* PRICE */}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Price (NPR) *
              </label>

              <input
                type="number"
                placeholder="650"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            {/* SALE PRICE */}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Sale Price (Optional)
              </label>

              <input
                type="number"
                placeholder="499"
                value={formData.salePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice:
                      e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Description
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
                placeholder="Write book description..."
                rows="4"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm resize-none"
              />
            </div>

            {/* FLAGS */}

            <div className="grid grid-cols-2 gap-3">

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    formData.featured
                  }
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    formData.flashSale
                  }
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    formData.bestSeller
                  }
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    formData.newArrival
                  }
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

            {/* BUTTON */}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-semibold"
            >
              <PlusCircle className="w-4 h-4" />

              SAVE INTO CATALOG
            </button>

          </form>
        </section>

        {/* RIGHT SIDE */}

        <section className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">

          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3 mb-5">
            <BookOpen className="w-4 h-4 text-indigo-500" />

            Currently Active Items ({books.length})
          </h3>

          <div className="space-y-4">

            {books.map((book) => (
              <div
                key={book._id}
                className="flex items-center justify-between border-b border-gray-100 pb-4"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={
                      book.image ||
                      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
                    }
                    alt={book.name}
                    className="w-12 h-16 rounded-lg object-cover"
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

                      {book.flashSale && (
                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full">
                          Flash Sale
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

                    {/* DESCRIPTION */}

                    <p className="text-xs text-gray-500 mt-2 max-w-md">
                      {book.description}
                    </p>

                  </div>
                </div>

                <div className="flex items-center gap-4">

                  <div>
                    <p className="font-bold text-gray-800">
                      NPR {book.price}
                    </p>

                    <button
                      onClick={() =>
                        handleToggleStock(book)
                      }
                      className={`text-xs px-3 py-1 rounded-full mt-2 ${
                        book.stockStatus ===
                        "In Stock"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {book.stockStatus}
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleDelete(book._id)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}

          </div>
        </section>
      </div>
    </div>
  );
}