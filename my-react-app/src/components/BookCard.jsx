import React from 'react';
import { useNavigate } from 'react-router-dom';

function BookCard({ product }) {
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // Replace this with your actual Add to Cart logic
    console.log("Added to cart:", product?.name || "Product");
    // This function does not call navigate(), so the UI stays on the same page
  };

  const handleBuyNow = () => {
    // Navigates to the checkout page
    navigate('/checkout');
  };

  return (
    <div className="border rounded-lg shadow-md p-4 w-60">
      <img
        src={product?.image || "https://via.placeholder.com/200"}
        alt={product?.name || "book"}
        className="w-full h-52 object-cover rounded"
      />

      <h2 className="text-xl font-bold mt-3">
        {product?.name || "Atomic Habits"}
      </h2>

      <p className="text-gray-500">
        {product?.author || "James Clear"}
      </p>

      <p className="text-green-600 font-bold mt-2">
        NPR {product?.price || "10"}
      </p>

      <div className="flex flex-col gap-2 mt-3">
        {/* Details button (optional, added for completeness) */}
        <button 
          onClick={() => navigate(`/product/${product?._id}`)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          Details
        </button>

        {/* Add to Cart button */}
        <button 
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add to Cart
        </button>

        {/* Buy Now button */}
        <button 
          onClick={handleBuyNow}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default BookCard;