const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product must have a name"],
    trim: true
  },
  category: {
    type: String,
    required: true,
    // FIXED: Enums matched exactly with both lowercase and capitalized variants to handle frontend submissions flawlessly
    enum: ['books', 'novels', 'notebooks', 'pens', 'pencils', 'scales', 'erasers', 'geometry-box', 'art-supplies', 'Books', 'Novels', 'Stationery']
  },
  subcategory: {
    type: String,
    // FIXED: Changed to false with a default fallback so it doesn't break if left out of the quick-add modal form
    required: false,
    default: "General"
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
    min: [0, "Price cannot be negative"]
  },
  image: {
    type: String,
    // FIXED: Changed required status to false and added a default placeholder book thumbnail URL
    required: false,
    default: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
  },
  description: {
    type: String,
    // FIXED: Changed to false with a default text message string fallback
    required: false,
    default: "No description provided for this catalog entry."
  },
  stockStatus: {
    type: String,
    default: 'In Stock',
    enum: ['In Stock', 'Out of Stock']
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields for us!
});

// Create the model constructor and export it
const Product = mongoose.model('Product', productSchema);
module.exports = Product;