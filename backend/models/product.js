const mongoose = require("mongoose");

const productCategories = [
  "Academic Books",
  "Novels & Literature",
  "Children's Books",
  "Religious Books",
  "Notebooks, Copies & Files",
  "Magazines & Newspapers",
  "Stationery Items",
];

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
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
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: productCategories,
    },

    subcategory: {
      type: String,
      default: "General",
      trim: true,
    },

    description: {
      type: String,
      default: "No description provided for this catalog entry.",
    },

    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    },
    images: {
  type: [String],
  default: [],
},

    // ================= PRICING =================
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: 0,
    },

    salePrice: {
      type: Number,
      default: null,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    // ================= STOCK SYSTEM =================
    stock: {
      type: Number,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    lowStockAlert: {
      type: Number,
      default: 5,
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Low Stock"],
      default: "In Stock",
    },

    statusFlag: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },

    // ================= BARCODE SYSTEM =================
    barcode: {
      type: String,
      unique: true,
      index: true,
    },

    sku: {
      type: String,
      unique: true,
      index: true,
    },

    // ================= PRODUCT FLAGS =================
    featured: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    // ================= FLASH SALE TIMER =================
    flashSaleStartsAt: {
      type: Date,
      default: null,
    },

    flashSaleExpiresAt: {
      type: Date,
      default: null,
    },

    // ================= REVIEWS =================
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

    // ================= ERP / POS SYSTEM =================
    lastSoldAt: {
      type: Date,
      default: null,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    profitMargin: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    barcodeType: {
      type: String,
      default: "CODE128",
    },

    taxRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;