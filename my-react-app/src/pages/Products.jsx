import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react'; 

const products = [
  // Novels / Self-Help Books
  {
    id: 1,
    name: 'Atomic Habits',
    category: 'novels',
    subcategory: 'Self-Help',
    price: 650,
    image: 'https://images.unsplash.com/photo-1528208079124-a2387f039c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Transform your life with tiny changes'
  },
  {
    id: 2,
    name: 'Rich Dad Poor Dad',
    category: 'novels',
    subcategory: 'Finance',
    price: 550,
    image: 'https://images.unsplash.com/photo-1580567754748-e77fff0a7e3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Financial literacy classic'
  },
  {
    id: 3,
    name: 'The Psychology of Money',
    category: 'novels',
    subcategory: 'Finance',
    price: 480,
    image: 'https://images.unsplash.com/photo-1526566762798-8fac9c07aa98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Timeless lessons on wealth and happiness'
  },
  {
    id: 4,
    name: 'Sapiens',
    category: 'novels',
    subcategory: 'History',
    price: 720,
    image: 'https://images.unsplash.com/photo-1610088660962-3f85d27cadc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A brief history of humankind'
  },

  // Academic Books
  {
    id: 5,
    name: 'Mathematics Grade 10',
    category: 'books',
    subcategory: 'Academic',
    price: 350,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'SEE level mathematics textbook'
  },
  {
    id: 6,
    name: 'Science Grade 8',
    category: 'books',
    subcategory: 'Academic',
    price: 280,
    image: 'https://images.unsplash.com/photo-1522836924445-4478bdeb860c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHxfHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Complete science guide for class 8'
  },
  {
    id: 7,
    name: 'English Guide Class 9',
    category: 'books',
    subcategory: 'Academic',
    price: 320,
    image: 'https://images.unsplash.com/photo-1616674282879-9edc598d77db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'English grammar and literature guide'
  },

  // Notebooks - Nepal specific brands
  {
    id: 8,
    name: 'Verma Notebook (200 pages)',
    category: 'notebooks',
    subcategory: 'Premium Notebooks',
    price: 180,
    image: 'https://images.unsplash.com/photo-1518226203301-8e7f833c6a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Premium quality hard cover notebook'
  },
  {
    id: 9,
    name: 'Verma Notebook (100 pages)',
    category: 'notebooks',
    subcategory: 'Premium Notebooks',
    price: 95,
    image: 'https://images.unsplash.com/photo-1531346852511-e39bf96dc721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Standard size premium notebook'
  },
  {
    id: 10,
    name: 'Student Notebook (Single Line)',
    category: 'notebooks',
    subcategory: 'Student Notebooks',
    price: 45,
    image: 'https://images.unsplash.com/photo-1610088660962-3f85d27cadc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Standard student notebook for daily use'
  },
  {
    id: 11,
    name: 'Student Notebook (Four Line)',
    category: 'notebooks',
    subcategory: 'Student Notebooks',
    price: 50,
    image: 'https://images.unsplash.com/photo-1531346852511-e39bf96dc721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Four line ruled for handwriting practice'
  },
  {
    id: 12,
    name: 'Register Copy (300 pages)',
    category: 'notebooks',
    subcategory: 'Register Copies',
    price: 220,
    image: 'https://images.unsplash.com/photo-1518226203301-8e7f833c6a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Large register for office and school use'
  },

  // Pens
  {
    id: 13,
    name: 'Cello Butterflow Pen',
    category: 'pens',
    subcategory: 'Ballpoint Pens',
    price: 20,
    image: 'https://images.unsplash.com/photo-1616674282879-9edc598d77db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Smooth writing ballpoint pen'
  },
  {
    id: 14,
    name: 'Reynolds Trimax Pen (Pack of 10)',
    category: 'pens',
    subcategory: 'Ballpoint Pens',
    price: 150,
    image: 'https://images.unsplash.com/photo-1616674282879-9edc598d77db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Premium quality blue pens pack'
  },
  {
    id: 15,
    name: 'Gel Pen Set (5 colors)',
    category: 'pens',
    subcategory: 'Gel Pens',
    price: 120,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vibrant colored gel pens'
  },
  {
    id: 16,
    name: 'Fountain Pen',
    category: 'pens',
    subcategory: 'Fountain Pens',
    price: 250,
    image: 'https://images.unsplash.com/photo-1616674282879-9edc598d77db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic fountain pen for elegant writing'
  },

  // Pencils
  {
    id: 17,
    name: 'Apsara Pencils (Pack of 10)',
    category: 'pencils',
    subcategory: 'Graphite Pencils',
    price: 80,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Premium quality HB pencils'
  },
  {
    id: 18,
    name: 'Mechanical Pencil 0.5mm',
    category: 'pencils',
    subcategory: 'Mechanical Pencils',
    price: 85,
    image: 'https://images.unsplash.com/photo-1531346852511-e39bf96dc721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Precision mechanical pencil'
  },
  {
    id: 19,
    name: 'Color Pencils Set (24 colors)',
    category: 'pencils',
    subcategory: 'Color Pencils',
    price: 320,
    image: 'https://images.unsplash.com/photo-1518226203301-8e7f833c6a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vibrant colors for art and drawing'
  },

  // Scales
  {
    id: 20,
    name: 'Plastic Scale 15cm',
    category: 'scales',
    subcategory: 'Rulers',
    price: 15,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Transparent plastic ruler'
  },
  {
    id: 21,
    name: 'Steel Scale 30cm',
    category: 'scales',
    subcategory: 'Rulers',
    price: 45,
    image: 'https://images.unsplash.com/photo-1531346852511-e39bf96dc721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Durable stainless steel ruler'
  },

  // Erasers
  {
    id: 22,
    name: 'Apsara Eraser (Pack of 5)',
    category: 'erasers',
    subcategory: 'Erasers',
    price: 25,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Dust-free erasers'
  },

  // Geometry Box
  {
    id: 23,
    name: 'Geometry Box Set',
    category: 'geometry-box',
    subcategory: 'Mathematical Instruments',
    price: 180,
    image: 'https://images.unsplash.com/photo-1531346852511-e39bf96dc721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Complete geometry instrument set'
  },

  // Art Supplies
  {
    id: 24,
    name: 'Drawing Book A4',
    category: 'art-supplies',
    subcategory: 'Drawing Books',
    price: 120,
    image: 'https://images.unsplash.com/photo-1518226203301-8e7f833c6a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Premium drawing paper for sketches'
  },
  {
    id: 25,
    name: 'Watercolor Set (12 colors)',
    category: 'art-supplies',
    subcategory: 'Paints',
    price: 280,
    image: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxib29rcyUyMHN0YXRpb25lcnklMjBub3RlYm9va3MlMjBkZXNrfGVufDF8fHx8MTc3ODgyMDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Artist quality watercolors'
  }
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('name');

  // Get unique subcategories based on selected category
  const subcategories = selectedCategory === 'all'
    ? ['all']
    : ['all', ...Array.from(new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory)))];

  // Filter products
  let filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const subcategoryMatch = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && subcategoryMatch && priceMatch;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  const categories = [
    { value: 'all', label: 'All Products', count: products.length },
    { value: 'books', label: 'Books', count: products.filter(p => p.category === 'books').length },
    { value: 'novels', label: 'Novels', count: products.filter(p => p.category === 'novels').length },
    { value: 'notebooks', label: 'Notebooks', count: products.filter(p => p.category === 'notebooks').length },
    { value: 'pens', label: 'Pens', count: products.filter(p => p.category === 'pens').length },
    { value: 'pencils', label: 'Pencils', count: products.filter(p => p.category === 'pencils').length },
    { value: 'scales', label: 'Scales & Rulers', count: products.filter(p => p.category === 'scales').length },
    { value: 'erasers', label: 'Erasers', count: products.filter(p => p.category === 'erasers').length },
    { value: 'geometry-box', label: 'Geometry Box', count: products.filter(p => p.category === 'geometry-box').length },
    { value: 'art-supplies', label: 'Art Supplies', count: products.filter(p => p.category === 'art-supplies').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
        <p className="text-lg text-gray-600">
          Browse our complete stationery collection - {filteredProducts.length} products available
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setSelectedSubcategory('all');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.label}</span>
                      <span className={`text-xs ${selectedCategory === category.value ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Filter */}
            {selectedCategory !== 'all' && subcategories.length > 1 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Subcategory</h3>
                <div className="space-y-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedSubcategory === sub
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {sub === 'all' ? 'All' : sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Price Range (NPR)
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceRange([0, 100])}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Under 100
                  </button>
                  <button
                    onClick={() => setPriceRange([100, 500])}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    100-500
                  </button>
                  <button
                    onClick={() => setPriceRange([500, 1000])}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    500+
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setPriceRange([0, 1000]);
                setSortBy('name');
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort Options */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  {/* Changed from ImageWithFallback to clean HTML img element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-indigo-600 font-medium">{product.subcategory}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-indigo-600">NPR {product.price}</span>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setPriceRange([0, 1000]);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}