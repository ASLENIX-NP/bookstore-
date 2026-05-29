const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: Number,

    paymentMethod: {
      type: String,
      default: "cash",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);