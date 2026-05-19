import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. DEFINE STRONGLY TYPED INTERFACE DATA CONTRACT RULES FOR TYPESCRIPT
interface CartItem {
  _id: string;      
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Cart() {
  const navigate = useNavigate();
  
  // 2. STATE TARGET IS ASSIGNED THE CARTITEM ARRAY ARRAY TYPE HINT
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to view your cart.");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    // 3. SECURE RAW DATA CAPTURE STEP TO BYPASS NULL COMPILER EXCEPTIONS
    const localCartData = localStorage.getItem("cart");
    const savedCart: CartItem[] = localCartData ? JSON.parse(localCartData) : [];
    setCartItems(savedCart);
  }, [navigate]);

  // Synchronize dynamic actions with LocalStorage tracking tables
  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Modify individual row item selection counters inside local states
  const updateQty = (id: string, delta: number) => {
    const updatedCart = cartItems.map((item) => {
      if (item._id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  // Completely drop single entity from client tracker arrays
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    saveCart(updatedCart);
  };

  // Calculate overall financial subtotal summaries
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans antialiased text-slate-600">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight border-b border-gray-100 pb-4 mb-6">
        Your Shopping Cart Bundle
      </h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
          <p className="text-sm font-bold text-gray-400">Your shopping cart is empty.</p>
          <button 
            onClick={() => navigate("/products")}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart List Node Layout Wrapper */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {cartItems.map((item) => (
              <div key={item._id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-12 h-16 object-cover rounded-lg bg-gray-50 border border-gray-100 shrink-0 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 tracking-tight line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">NPR {item.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Plus Minus Quantity Action Counter Module */}
                  <div className="flex items-center gap-2 border border-gray-200 bg-slate-50 p-1 rounded-xl">
                    <button 
                      onClick={() => updateQty(item._id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-black px-2 text-gray-800 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQty(item._id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Summary Pricing Action Panel */}
                  <div className="text-right flex items-center gap-4">
                    <span className="text-sm font-black text-slate-900 tracking-tight">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => removeItem(item._id)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Invoice Totals Card Footer Layout */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Cart Estimate</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">NPR {subtotal.toLocaleString()}</h3>
            </div>
            <button className="w-full sm:w-auto bg-slate-950 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer">
              Proceed To Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}