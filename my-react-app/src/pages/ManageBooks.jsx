import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, XCircle, Loader2, PackageMinus } from 'lucide-react';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal Form State Control
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Books',
    price: '',
    description: '',
    stockStatus: 'In Stock'
  });

  // Fetch all inventory books from our backend REST API cluster layout pipeline
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setBooks(response.data);
      setError('');
    } catch (err) {
      console.error("Error reading database catalog documents:", err);
      setError('Could not establish synchronization connection with inventory cluster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Safe Request Validation Form Handling Payload Routine
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const numericalStockCount = formData.stockStatus === 'In Stock' ? 15 : 0;

      // Bulletproof combined property mapping matrix object
      const safePayload = {
        name: formData.name,
        title: formData.name, // Fallback if schema expects 'title'
        category: formData.category,
        price: Number(formData.price),
        description: formData.description || 'No alternative descriptions documented.',
        
        // Stock field alignment properties
        stockStatus: formData.stockStatus,
        status: formData.stockStatus,
        countInStock: numericalStockCount,
        stock: numericalStockCount,
        quantity: numericalStockCount
      };

      await axios.post('http://localhost:5000/api/products', safePayload);
      
      // Clear out fields and refresh live table grid metrics
      setShowModal(false);
      setFormData({ name: '', category: 'Books', price: '', description: '', stockStatus: 'In Stock' });
      fetchInventory();
    } catch (err) {
      console.error("❌ Mongoose Validation Detailed Logs Object:", err.response?.data);
      
      // Pull explicit field validation error messages directly out of Express responses
      const validationErrorMessage = err.response?.data?.error || err.response?.data?.message;
      alert(validationErrorMessage ? `Server Validation Alert: ${validationErrorMessage}` : 'Failed to add product entry. Check console metrics logs.');
    }
  };

  // Instantly toggle availability with backend database allocations sync
  const toggleStockStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      // Optimistic layout update UI side
      setBooks(books.map(b => b._id === id ? { ...b, stockStatus: nextStatus } : b));
      
      await axios.patch(`http://localhost:5000/api/products/${id}`, {
        stockStatus: nextStatus
      });
    } catch (err) {
      console.error("Failed to alter stock status:", err);
      fetchInventory(); // Revert back safely on network failures
    }
  };

  // Purge an item cleanly out of MongoDB Atlas collection sets
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to completely purge this item from your public catalog?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setBooks(books.filter(b => b._id !== id));
    } catch (err) {
      console.error("Error running purge routine request:", err);
      alert('Error clearing selected item allocation entry.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Reading system catalog records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Interface Controls Header Row Container */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Direct control parameters over items, active stock conditions, and storefront listings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl">
          {error}
        </div>
      )}

      {/* Main Admin Product Inventory Records Data Grid Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Status Flag</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {books.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                    <PackageMinus className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No products discovered inside the cluster directory database.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{book.name || book.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{book.description || 'No custom details defined.'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500">{book.category}</td>
                    <td className="px-6 py-4 font-black text-gray-900">NPR {book.price}</td>
                    
                    {/* Live Toggling Status Flag Switcher Badge */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStockStatus(book._id, book.stockStatus)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          book.stockStatus === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                        title="Click to instantly toggle availability status"
                      >
                        {book.stockStatus === 'In Stock' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            In Stock
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Out of Stock
                          </>
                        )}
                      </button>
                    </td>
                    
                    {/* Catalog Removal Purge Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(book._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Remove product listing permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POPUP SUBMISSION VIEW OVERLAY LAYER */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Add New Product Entry</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Product Title Name *</label>
                <input
                  type="text" required name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="e.g., Atomic Habits"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category *</label>
                  <select
                    name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Books">Books</option>
                    <option value="Novels">Novels</option>
                    <option value="Notebooks">Notebooks</option>
                    <option value="Pens">Pens</option>
                    <option value="Pencils">Pencils</option>
                    <option value="Scales & Rulers">Scales & Rulers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Price (NPR) *</label>
                  <input
                    type="number" required min="1" name="price" value={formData.price} onChange={handleInputChange}
                    placeholder="850"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Default Availability Status</label>
                <select
                  name="stockStatus" value={formData.stockStatus} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-amber-500"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Brief Product Description</label>
                <textarea
                  name="description" rows="3" value={formData.description} onChange={handleInputChange}
                  placeholder="Provide brief product outline summary features..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10 rounded-xl transition-all cursor-pointer"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}