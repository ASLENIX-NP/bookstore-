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
    enum: ['books', 'novels', 'notebooks', 'pens', 'pencils', 'scales', 'erasers', 'geometry-box', 'art-supplies']
  },
  subcategory: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: [true, "A product must have a price"],
    min: [0, "Price cannot be negative"]
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields for us!
});

// Create the model constructor and export it
const Product = mongoose.model('Product', productSchema);
module.exports = Product;