import { useState } from "react";
import { Filter } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Vintage Leather Journal",
    category: "notebooks",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1518226203301-8e7f833c6a94",
    description: "Handcrafted leather-bound journal with premium paper",
  },
  {
    id: 2,
    name: "Classic Literature Set",
    category: "books",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1528208079124-a2387f039c99",
    description: "Collection of timeless classics in hardcover",
  },
  {
    id: 3,
    name: "Minimalist Notebook",
    category: "notebooks",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1610088660962-3f85d27cadc7",
    description: "Clean design notebook perfect for daily notes",
  },
  {
    id: 4,
    name: "Executive Desk Set",
    category: "stationery",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1495465798138-718f86d1a4bc",
    description: "Complete desk organization set for professionals",
  },
  {
    id: 5,
    name: "Coffee & Books",
    category: "books",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1526566762798-8fac9c07aa98",
    description: "Curated selection of cozy reads",
  },
  {
    id: 6,
    name: "Premium Writing Set",
    category: "pens",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1616674282879-9edc598d77db",
    description: "Luxury pens and writing instruments",
  },
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const categories = [
    { value: "all", label: "All Products" },
    { value: "books", label: "Books" },
    { value: "notebooks", label: "Notebooks" },
    { value: "stationery", label: "Stationery" },
    { value: "pens", label: "Pens & Writing" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Our Products</h1>
        <p className="text-gray-600">
          Browse our curated collection of books and stationery
        </p>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="font-semibold">Filter by Category</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-5 py-2 rounded-full ${
                selectedCategory === category.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {product.description}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-indigo-600 font-bold">
                  ${product.price}
                </span>

                <button className="bg-indigo-600 text-white px-4 py-2 rounded">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          No products found.
        </div>
      )}
    </div>
  );
}