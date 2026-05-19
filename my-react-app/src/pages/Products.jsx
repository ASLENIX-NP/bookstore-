import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, AlertCircle, Bookmark } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch live catalog dataset streams from your node api process server
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Error reading database array logs:", err);
        setError("Unable to process the store repository streams.");
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Add item to cart and store securely inside local storage memory
  const addToCart = (product) => {
    // Grab the existing collection or fall back to an empty string array
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item has already been staged inside the registry
    const existingItem = currentCart.find(item => item._id === product._id);
    
    if (existingItem) {
      // Increment product counter details
      existingItem.quantity += 1;
    } else {
      // Append structured item object mapping properties safely to match Cart.tsx rules
      currentCart.push({
        _id: product._id,
        title: product.name,   // Maps schema 'name' to cart tracking 'title'
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    // Commit modification array state back to client storage block
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`"${product.name}" successfully added to your cart! 🛒`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 min-h-screen">
      
      {/* Page Header Layout Block */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Bookmark className="text-orange-500 w-7 h-7" /> Discover Our Literature Catalog
        </h2>
        <p className="text-sm text-gray-500 mt-1.5">Browse through our live production library inventory repository nodes.</p>
      </div>

      {/* Loading Progress Spinner View */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-xs text-gray-400 font-semibold">Streaming real-time catalogs...</p>
        </div>
      )}

      {/* Connection Fault Alert Screen Boundary Layout */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-start gap-3 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Cluster Synchronization Timeout</h4>
            <p className="text-xs text-red-600/90 mt-1">Please verify if your Node.js server.js backend script process is currently running on port 5000.</p>
          </div>
        </div>
      )}

      {/* Main Catalog Rendering Flow Logic Block */}
      {!loading && !error && (
        products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 p-8 max-w-md mx-auto">
            <p className="text-sm font-bold text-gray-400">Our stock shelves are temporarily empty.</p>
            <p className="text-xs text-gray-400 mt-1">Add items from the Admin Panel's "Manage Books" route.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
                
                {/* Product Thumbnail Cover Window Container */}
                <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden border-b border-gray-50">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500"} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                  />
                  
                  {/* Sold Out Mask Screen Overlay Modifiers */}
                  {product.statusFlag === 'Out of Stock' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">Sold Out</span>
                    </div>
                  )}
                </div>

                {/* Card Content Details Footer Cluster info items */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                      {product.category || 'General'}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors pt-1">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {product.description || 'No descriptive overview details added for this product record entity.'}
                    </p>
                  </div>

                  {/* Pricing and Submission Trigger Binding */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      NPR {Number(product.price).toLocaleString()}
                    </span>
                    <button
                      disabled={product.statusFlag === 'Out of Stock'}
                      onClick={() => addToCart(product)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        product.statusFlag === 'Out of Stock' 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Buy
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}