import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ManageBooks() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [description, setDescription] = useState('');

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error("Database fetch error:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleToggleStock = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      await axios.patch(`http://localhost:5000/api/products/${id}`, { stockStatus: nextStatus });
      fetchInventory();
    } catch (err) {
      console.error("Stock status modification failure:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Purge this item entirely from database records?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchInventory();
    } catch (err) {
      console.error("Deletion failure:", err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Map fields accurately to match backend model schema specifications perfectly
    const productPayload = {
      name: title, // Fixed: Sends input state 'title' matching backend property 'name'
      price: Number(price),
      category: category,
      subcategory: 'General', // Fixed: Matches your backend schema requirements
      description: description || 'No description provided',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e', // Stand-in image link fallback
      stockStatus: 'In Stock'
    };

    try {
      await axios.post('http://localhost:5000/api/products', productPayload);
      setShowModal(false);
      // Flush form inputs
      setTitle('');
      setPrice('');
      setDescription('');
      fetchInventory();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to process record addition loop.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Management Hub</h2>
          <p className="text-xs text-gray-500">Manage live items, control stock flags, and view real-time changes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Live Data Grid Layout view panel */}
      {products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-200 flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-400">No products discovered inside the cluster directory database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Price</th>
                <th className="p-4 text-center">Status Flag</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 font-medium transition-colors">
                  <td className="p-4">
                    {/* Fixed to read from product.name returned from backend schema models */}
                    <span className="font-bold text-gray-900 block text-sm">{product.name || product.title}</span>
                    <span className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{product.description || 'No description provided'}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide">{product.category}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-900">NPR {product.price?.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleStock(product._id, product.stockStatus)}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg border cursor-pointer transition-all ${
                        product.stockStatus === 'In Stock' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {product.stockStatus}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all cursor-pointer inline-block"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add View Box Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Add New Product Entry</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-base cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3.5 rounded-xl font-medium flex items-start gap-2">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Server Validation Alert:</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider block">Product Title Name *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Atomic Habits" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider block">Price (NPR) *</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="850" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"/>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500 uppercase tracking-wider block">Category Segment *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all">
                    <option value="Books">Books</option>
                    <option value="Novels">Novels</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 uppercase tracking-wider block">Brief Product Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide brief product outline summary features..." className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"/>
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors shadow-sm">Save to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}