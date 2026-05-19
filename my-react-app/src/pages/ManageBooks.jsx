import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, BookOpen, Trash2, Layers, AlertCircle, Upload } from 'lucide-react';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Novels',
    price: '',
    statusFlag: 'In Stock',
    description: '',
    image: '' // This will now store the converted Base64 string safely
  });

  // Helper function to transform file streams into strings
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Guard constraint to block massive files from overloading your MongoDB document limits
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please select an image under 2MB.");
      e.target.value = ""; // Clear file picker value
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.onerror = (err) => {
      console.error("Error reading file stream:", err);
    };
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setBooks(res.data);
      setError(null);
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError("Failed to reach backend cluster API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/products', {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        statusFlag: formData.statusFlag,
        description: formData.description || "No description provided",
        image: formData.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"
      });

      if (res.data) {
        setBooks([...books, res.data]);
        // Reset state values cleanly
        setFormData({ name: '', category: 'Novels', price: '', statusFlag: 'In Stock', description: '', image: '' });
        
        // Reset the native HTML file input field on the screen
        const fileInput = document.getElementById('bookImageInput');
        if (fileInput) fileInput.value = "";

        alert("Product saved and synced successfully!");
        setError(null);
      }
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create new item. Check your backend logs.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setBooks(books.filter(book => book._id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="text-orange-500 w-6 h-6" /> Inventory Management Hub
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage live items, control stock flags, and upload custom covers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACCESSION FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <PlusCircle className="w-4 h-4 text-orange-500" /> Add New Product
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Atomic Habits"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white text-gray-700 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-bold text-gray-600 cursor-pointer"
                >
                  <option value="Novels">Novels</option>
                  <option value="Books">Books</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Notebooks">Notebooks</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Status</label>
                <select
                  value={formData.statusFlag}
                  onChange={(e) => setFormData({ ...formData, statusFlag: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none font-bold text-gray-600 cursor-pointer"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (NPR) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="650"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none text-gray-700 font-medium"
                />
              </div>

              {/* UPGRADED NATIVE FILE PICKER DESIGN BLOCK */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Upload Product Cover Image</label>
                <div className="relative flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <p className="text-[11px] text-gray-500 font-medium">
                        {formData.image ? <span className="text-emerald-600 font-bold">✓ Image Ready</span> : "Click to select local file"}
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
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Short Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Transform your life with tiny changes..."
                rows="2"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none text-gray-700 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Save Into Catalog
            </button>
          </form>
        </div>

        {/* ACTIVE INVENTORY HUB VIEW */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Currently Active Matrix Items ({books.length})
          </h3>

          {loading && <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Syncing data stream...</div>}
          {error && <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

          {!loading && !error && books.length === 0 ? (
            <p className="text-xs font-medium text-gray-400 bg-gray-50 p-8 rounded-xl text-center border border-dashed border-gray-200">No active inventory items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Product Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-600 font-medium">
                  {books.map(book => (
                    <tr key={book._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={book.image} alt="cover" className="w-7 h-10 object-cover rounded shadow-sm bg-gray-50 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">{book.name}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{book.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-slate-500">{book.category}</span></td>
                      <td className="px-4 py-3 font-bold text-slate-800">NPR {book.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          book.statusFlag === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {book.statusFlag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(book._id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}