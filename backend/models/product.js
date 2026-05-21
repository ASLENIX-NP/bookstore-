const mongoose = require('mongoose');

const productCategories = [
  'Academic Books',
  'Novels & Literature',
  "Children's Books",
  'Religious Books',
  'Notebooks, Copies & Files',
  'Magazines & Newspapers',
  'Stationery Items',
];

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: productCategories,
    },

    subcategory: {
      type: String,
      required: false,
      default: 'General',
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [0, 'Price cannot be negative'],
    },

    image: {
      type: String,
      required: false,
      default:
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
    },

    description: {
      type: String,
      required: false,
      default:
        'No description provided for this catalog entry.',
    },

    // FEATURED PRODUCT FIELD
    featured: {
      type: Boolean,
      default: false,
    },

    stockStatus: {
      type: String,
      default: 'In Stock',
      enum: ['In Stock', 'Out of Stock'],
    },

    statusFlag: {
      type: String,
      default: 'In Stock',
      enum: ['In Stock', 'Out of Stock'],
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product ||
  mongoose.model('Product', productSchema);

module.exports = Product;