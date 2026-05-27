const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // USER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    email: {
      type: String,
      required: true,
    },

    // PRODUCTS
    orderItems: [
      {
        title: {
          type: String,
          required: true,
        },

        qty: {
          type: Number,
          required: true,
          default: 1,
        },

        price: {
          type: Number,
          required: true,
        },
      },
    ],

    // VAT / PRICE SUMMARY

    // FINAL PRODUCT PRICE (WITH VAT)
    productSubtotal: {
      type: Number,
      default: 0,
    },

    // PRODUCT PRICE WITHOUT VAT
    productWithoutVat: {
      type: Number,
      default: 0,
    },

    // DELIVERY
    deliveryCharge: {
      type: Number,
      default: 0,
    },

    // ONLY PRODUCT TAXABLE
    taxableAmount: {
      type: Number,
      default: 0,
    },

    // VAT RATE
    vatRate: {
      type: Number,
      default: 13,
    },

    // VAT AMOUNT
    vatAmount: {
      type: Number,
      default: 0,
    },

    // GRAND TOTAL
    grandTotal: {
      type: Number,
      default: 0,
    },

    // PAYMENT
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    // ORDER TRACKING
    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "packaging",
        "shipped",
        "delivered",
        "cancelled",
      ],

      default: "pending",
    },

    estimatedDelivery: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);