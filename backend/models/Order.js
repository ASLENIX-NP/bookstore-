const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // If you link it to a registered user from your User.js model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Set to false if you want to support guest checkouts
    },
    email: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        title: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      default: "Processing", // Processing, Completed, Cancelled
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);