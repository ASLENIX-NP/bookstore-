import React from 'react';
import { Book, PenTool, Notebook, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from "../components/ImageWithFallback";

const Home = () => {
  const products = [
    { id: 1, name: "Classic Leather Journal", category: "Notebooks", price: 24.99, img: "https://images.unsplash.com/photo-1544816153-1515121f20c4?w=400" },
    { id: 2, name: "Premium Book Collection", category: "Books", price: 45.99, img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
    { id: 3, name: "Designer Notebook Set", category: "Stationery", price: 19.99, img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400" },
    { id: 4, name: "Executive Desk Set", category: "Stationery", price: 34.99, img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="bg-[#6366F1] text-white py-20 px-10 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold leading-tight">Discover Your Next Great Read</h1>
          <p className="text-lg opacity-90">Premium books, notebooks, and stationery for readers and writers.</p>
          <div className="flex gap-4">
            <button className="bg-white text-[#6366F1] px-6 py-3 rounded-md font-semibold flex items-center gap-2">Shop Now <ArrowRight size={18} /></button>
            <button className="border border-white px-6 py-3 rounded-md font-semibold">Learn More</button>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <ImageWithFallback src="https://images.unsplash.com/photo-1544816153-1515121f20c4?w=600" className="rounded-xl shadow-2xl w-full max-w-md" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 px-10">
        <h2 className="text-3xl font-bold mb-10">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img src={p.img} alt={p.name} className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs text-gray-400 uppercase">{p.category}</p>
                <h3 className="font-bold text-gray-800">{p.name}</h3>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[#6366F1] font-bold">${p.price}</span>
                  <button className="bg-[#6366F1] text-white px-3 py-1.5 rounded text-sm">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store CTA */}
      <section className="bg-[#6366F1] py-20 text-center text-white px-10">
        <h2 className="text-4xl font-bold mb-4">Visit Our Store Today</h2>
        <button className="bg-white text-[#6366F1] px-8 py-3 rounded-md font-bold mt-4">Find Us</button>
      </section>
    </div>
  );
};

export default Home;