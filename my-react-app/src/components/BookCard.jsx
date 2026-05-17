function BookCard() {
  return (
    <div className="border rounded-lg shadow-md p-4 w-60">
      <img
        src="https://via.placeholder.com/200"
        alt="book"
        className="w-full h-52 object-cover rounded"
      />

      <h2 className="text-xl font-bold mt-3">
        Atomic Habits
      </h2>

      <p className="text-gray-500">
        James Clear
      </p>

      <p className="text-green-600 font-bold mt-2">
        $10
      </p>

      <button className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
        Add to Cart
      </button>
    </div>
  );
}

export default BookCard;