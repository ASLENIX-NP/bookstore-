const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fileUpload = require("express-fileupload");
const calculateDelivery = require("./utils/deliveryCalculator");

const imagekit = require("./config/imagekit");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

// IMPORT MODELS
const Product = require("./models/product");
const AdminModel = require("./models/Admin");
const User = require("./models/User");
const Message = require("./models/Message");

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;
const toPaisa = (value) => Math.round(Number(value || 0) * 100);

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

const ESEWA_PAYMENT_URL =
  process.env.ESEWA_PAYMENT_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const ESEWA_STATUS_CHECK_URL =
  process.env.ESEWA_STATUS_CHECK_URL ||
  "https://rc.esewa.com.np/api/epay/transaction/status/";

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const STRIPE_CURRENCY = process.env.STRIPE_CURRENCY || "npr";

console.log("KHALTI_SECRET_KEY loaded:", Boolean(process.env.KHALTI_SECRET_KEY));
console.log("ESEWA_SECRET_KEY loaded:", Boolean(process.env.ESEWA_SECRET_KEY));
console.log("STRIPE_SECRET_KEY loaded:", Boolean(process.env.STRIPE_SECRET_KEY));

// ORDER SCHEMA & MODEL
const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      default: "Guest Customer",
    },

    phone: {
      type: String,
      default: "",
    },

    deliveryInfo: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      region: { type: String, default: "" },
      city: { type: String, default: "" },
      building: { type: String, default: "" },
      area: { type: String, default: "" },
      address: { type: String, default: "" },
      label: { type: String, default: "Home" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
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
        subtotal: {
          type: Number,
          default: 0,
        },
      },
    ],

    productSubtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      default: 100,
    },

    deliveryDistanceKm: {
      type: Number,
      default: 0,
    },

    estimatedDelivery: {
      type: String,
      default: "",
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    vatRate: {
      type: Number,
      default: 13,
    },

    vatAmount: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    checkoutType: {
  type: String,
  enum: ["Cart", "Buy Now", "POS"],
  default: "Cart",
},

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
      default: "Pending",
      enum: ["Pending", "Paid", "Failed", "Verification Required"],
    },

    orderStatus: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Confirmed", "Completed", "Cancelled"],
    },

    status: {
      type: String,
      required: true,
      default: "Processing",
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

    khaltiPidx: {
      type: String,
      default: "",
    },

    khaltiPaymentUrl: {
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

    esewaRefId: {
      type: String,
      default: "",
    },

    esewaStatus: {
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
      default: null,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// POLICY SCHEMA & MODEL
const policySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Policy =
  mongoose.models.Policy || mongoose.model("Policy", policySchema);

const defaultPolicies = [
  {
    key: "terms",
    title: "Terms & Conditions",
    content: `Welcome to PatraPatrika Center.

By using our website, you agree to follow these Terms and Conditions.

1. Products and Availability
PatraPatrika Center sells books, magazines, newspapers, stationery, and related products. Product availability depends on stock and may change at any time.

2. Pricing
Prices are shown in NPR. Prices may change without prior notice. VAT and delivery charges may be added where applicable.

3. Orders
Orders are confirmed only after successful payment verification or admin approval for Cash on Delivery.

4. Customer Information
Customers must provide correct name, phone number, email, and delivery address.

5. Order Cancellation
PatraPatrika Center may cancel an order if stock is unavailable, payment fails, customer information is incorrect, or suspicious activity is detected.

6. Invoice
VAT invoice will be provided where applicable after payment confirmation.

7. Limitation
PatraPatrika Center is not responsible for delays caused by incorrect address, courier delay, weather, public holidays, or circumstances outside our control.`,
  },
  {
    key: "privacy",
    title: "Privacy Policy",
    content: `PatraPatrika Center respects your privacy.

1. Information We Collect
We may collect your name, email, phone number, delivery address, order details, payment method, transaction status, and contact messages.

2. How We Use Information
We use your information to create accounts, process orders, deliver products, verify payments, generate invoices, provide customer support, and prevent fraud.

3. Payment Information
We do not store card numbers, wallet PINs, CVV, banking passwords, or sensitive payment credentials. Payments are processed through third-party payment gateways.

4. Data Sharing
We do not sell your personal data. We may share required delivery details with delivery partners or payment verification details with payment providers.

5. Data Security
We use reasonable security practices to protect customer information.

6. Data Retention
Order, invoice, and contact information may be kept for business, tax, support, and legal purposes.

7. Contact
For privacy questions, contact PatraPatrika Center.`,
  },
  {
    key: "return",
    title: "Return, Refund & Cancellation Policy",
    content: `1. Cancellation
Customers may request cancellation before the order is confirmed, packed, shipped, paid, or delivered.

2. Return
Returns are accepted only for damaged, wrong, defective, or missing products. Customers should report the issue within 24 to 48 hours of delivery.

3. Return Condition
Returned products must be unused and in original condition. Books with writing, torn pages, used condition, or customer-caused damage may not be accepted.

4. Refund
Refunds are processed after admin verification. Refunds are made through the original payment method where possible.

5. Delivery Charge
Delivery charge may not be refundable unless the mistake is from PatraPatrika Center.`,
  },
  {
    key: "shipping",
    title: "Shipping & Delivery Policy",
    content: `1. Delivery Area
Delivery is available only in selected locations of Nepal.

2. Delivery Charge
Delivery charge is shown during checkout and may depend on location.

3. Delivery Time
Delivery time may vary based on location, stock, courier availability, weather, and public holidays.

4. Customer Responsibility
Customer must provide correct phone number and delivery address.

5. Failed Delivery
If delivery fails because of wrong address, unreachable phone, or customer unavailability, the order may be delayed or cancelled.`,
  },
  {
    key: "contact",
    title: "Contact Information",
    content: `Business Name: PatraPatrika Center
PAN/VAT Number: 000000000
Address: 000000
Phone: 000000
Email: patrapatrika23@gmail.com
Website: 000000

For order support, payment issues, refund requests, or delivery questions, please contact us using the details above.`,
  },
  {
    key: "aboutPage",
    title: "A community built around books, learning, and creativity.",
    content: `We bring together quality books, fine stationery, and a friendly local store experience for readers, students, writers, and families.

PatraPatrika Center is dedicated to providing books, magazines, newspapers, educational materials, and stationery items to readers, students, and families.

Our goal is to make reading materials and learning essentials easily available through a simple online shopping experience.`,
  },
  {
    key: "contactPage",
    title: "We are here to help with your books and stationery needs.",
    content: `Have a question about a book, magazine, stationery order, or availability? Send us your message and our team will respond as soon as possible.`,
  },
  {
    key: "contactDetails",
    title: "Contact Details",
    content: JSON.stringify(
      {
        primaryEmail: "support@PatraPatrikaCenter.com",
        secondaryEmail: "info@patrapatrikacentre.com",
        phone: "+977-9866666666",
        whatsappNumber: "9779866666666",
        storeName: "PatraPatrika Center",
        address: "Parijat Marg, Hetauda, Nepal",
        responseTime: "We usually reply within a few hours.",
        mapUrl: "https://www.google.com/maps/place/Parijat+Marg,+Hetauda+44107",
      },
      null,
      2
    ),
  },
];

const seedPolicies = async () => {
  try {
    for (const policy of defaultPolicies) {
      await Policy.findOneAndUpdate(
        { key: policy.key },
        {
          $set: {
            title: policy.title,
          },
          $setOnInsert: {
            content: policy.content,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );
    }

    console.log("Policy pages ready ✅");
  } catch (error) {
    console.error("Policy seed error:", error.message);
  }
};