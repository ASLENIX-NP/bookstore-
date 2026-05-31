const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    date: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

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
      lowercase: true,
      trim: true,
    },

    customerName: {
      type: String,
      default: "Customer",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // DELIVERY / CUSTOMER INFO
    deliveryInfo: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      region: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      building: {
        type: String,
        default: "",
      },

      area: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },

      label: {
        type: String,
        default: "Home",
      },

      lat: {
        type: Number,
        default: null,
      },

      lng: {
        type: Number,
        default: null,
      },
    },

    // PRODUCTS
    orderItems: {
      type: [orderItemSchema],
      default: [],
    },

    // CHECKOUT TYPE
    checkoutType: {
      type: String,
      enum: ["Cart", "Buy Now", "POS"],
      default: "Cart",
    },

    // VAT / PRICE SUMMARY

    // FINAL PRODUCT PRICE
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

    deliveryDistanceKm: {
      type: Number,
      default: 0,
    },

    estimatedDelivery: {
      type: String,
      default: "",
    },

    // TAXABLE
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

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // PAYMENT
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    paymentMethodId: {
      type: String,
      default: "cod",
    },

    paymentGateway: {
      type: String,
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Verification Required"],
      default: "Pending",
    },

    transactionId: {
      type: String,
      default: "",
    },

    paymentProof: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // ORDER TRACKING
    orderStatus: {
      type: String,
      enum: [
        "Processing",
        "Confirmed",
        "Packaging",
        "Shipped",
        "Delivered",
        "Completed",
        "Cancelled",
        "pending",
        "confirmed",
        "packaging",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "Processing",
    },

    status: {
      type: String,
      enum: [
        "Processing",
        "Confirmed",
        "Packaging",
        "Shipped",
        "Delivered",
        "Completed",
        "Cancelled",
        "pending",
        "confirmed",
        "packaging",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "Processing",
    },

    trackingSteps: {
      type: [trackingStepSchema],
      default: [],
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: String,
      default: "",
    },

    cancelReason: {
      type: String,
      default: "",
    },

    // PAYMENT GATEWAY EXTRA FIELDS
    khaltiPidx: {
      type: String,
      default: "",
    },

    khaltiStatus: {
      type: String,
      default: "",
    },

    esewaTransactionUuid: {
      type: String,
      default: "",
    },

    esewaStatus: {
      type: String,
      default: "",
    },

    esewaRefId: {
      type: String,
      default: "",
    },

    stripeSessionId: {
      type: String,
      default: "",
    },

    stripePaymentIntentId: {
      type: String,
      default: "",
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;