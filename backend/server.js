const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const path = require("path")

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const crypto = require("crypto");
const express = require("express");
const QRCode = require("qrcode");
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
const { v4: uuidv4 } = require("uuid");
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

const ORDER_STATUSES = [
  "Processing",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
  "Failed Delivery",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
  "Verification Required",
];

const TRACKING_STEP_TITLES = [
  "Processing",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Completed",
];

const makeTrackingSteps = (currentStatus = "Processing") => {
  const normalizedStatus = normalizeOrderStatus(currentStatus) || "Processing";
  const currentIndex = TRACKING_STEP_TITLES.indexOf(normalizedStatus);

  return TRACKING_STEP_TITLES.map((title, index) => ({
    title,
    completed:
      normalizedStatus === "Cancelled" ||
      normalizedStatus === "Failed Delivery"
        ? false
        : currentIndex >= index,
    date:
      normalizedStatus === "Cancelled" ||
      normalizedStatus === "Failed Delivery"
        ? null
        : currentIndex >= index
        ? new Date()
        : null,
  }));
};

const normalizeOrderStatus = (value) => {
  const status = String(value || "").trim();

  if (!status) return null;

  const aliasMap = {
    pending: "Processing",
    processing: "Processing",
    confirmed: "Confirmed",
    packaging: "Packaging",
    packed: "Packaging",
    shipped: "Shipped",
    "out for delivery": "Out for Delivery",
    outfordelivery: "Out for Delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    "failed delivery": "Failed Delivery",
    faileddelivery: "Failed Delivery",
  };

  const key = status.toLowerCase().replace(/\s+/g, " ");

  return aliasMap[key] || null;
};

const normalizePaymentStatus = (value) => {
  const status = String(value || "").trim();

  const matchedStatus = PAYMENT_STATUSES.find(
    (item) => item.toLowerCase() === status.toLowerCase()
  );

  return matchedStatus || null;
};

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
      enum: ORDER_STATUSES,
    },

    status: {
      type: String,
      required: true,
      default: "Processing",
      enum: ORDER_STATUSES,
    },

    trackingSteps: {
      type: [trackingStepSchema],
      default: () => makeTrackingSteps("Processing"),
    },

    deliveryPartner: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      company: {
        type: String,
        default: "",
      },

      trackingNumber: {
        type: String,
        default: "",
      },

      note: {
        type: String,
        default: "",
      },
    },

    deliveryLastUpdatedAt: {
      type: Date,
      default: null,
    },
           deliveryUpdateToken: {
      type: String,
      default: "",
      index: true,
    },

   deliveryUpdateTokenCreatedAt: {
  type: Date,
  default: null,
},

deliveryUpdateTokenExpiresAt: {
  type: Date,
  default: null,
  index: true,
},

    cashCollected: {
      type: Boolean,
      default: false,
    },

    cashCollectedAmount: {
      type: Number,
      default: 0,
    },

    cashCollectedAt: {
      type: Date,
      default: null,
    },

    deliveryFailureReason: {
      type: String,
      default: "",
    },

    deliveryUpdateHistory: [
      {
        status: {
          type: String,
          default: "",
        },

        note: {
          type: String,
          default: "",
        },

        updatedBy: {
          type: String,
          default: "Delivery Partner",
        },

        cashCollected: {
          type: Boolean,
          default: false,
        },

        cashCollectedAmount: {
          type: Number,
          default: 0,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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
const DELIVERY_UPDATE_TOKEN_EXPIRY_DAYS = Number(
  process.env.DELIVERY_UPDATE_TOKEN_EXPIRY_DAYS || 7
);

const DELIVERY_UPDATE_TOKEN_EXPIRY_MS =
  DELIVERY_UPDATE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const createDeliveryUpdateTokenExpiry = (fromDate = new Date()) => {
  const startDate = new Date(fromDate);

  if (Number.isNaN(startDate.getTime())) {
    return new Date(Date.now() + DELIVERY_UPDATE_TOKEN_EXPIRY_MS);
  }

  return new Date(startDate.getTime() + DELIVERY_UPDATE_TOKEN_EXPIRY_MS);
};

const issueDeliveryUpdateToken = (order) => {
  const now = new Date();

  order.deliveryUpdateToken = crypto.randomBytes(32).toString("hex");
  order.deliveryUpdateTokenCreatedAt = now;
  order.deliveryUpdateTokenExpiresAt = createDeliveryUpdateTokenExpiry(now);

  return order;
};

const getDeliveryUpdateTokenExpiresAt = (order) => {
  if (order?.deliveryUpdateTokenExpiresAt) {
    return new Date(order.deliveryUpdateTokenExpiresAt);
  }

  if (order?.deliveryUpdateTokenCreatedAt) {
    return createDeliveryUpdateTokenExpiry(order.deliveryUpdateTokenCreatedAt);
  }

  return null;
};

const isDeliveryUpdateTokenExpired = (order) => {
  const expiresAt = getDeliveryUpdateTokenExpiresAt(order);

  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return true;
  }

  return expiresAt <= new Date();
};

const ensureDeliveryUpdateTokenExpiry = (order) => {
  if (!order.deliveryUpdateToken) {
    return;
  }

  if (!order.deliveryUpdateTokenCreatedAt) {
    order.deliveryUpdateTokenCreatedAt = new Date();
  }

  if (!order.deliveryUpdateTokenExpiresAt) {
    order.deliveryUpdateTokenExpiresAt = createDeliveryUpdateTokenExpiry(
      order.deliveryUpdateTokenCreatedAt
    );
  }
};
const notificationSchema = new mongoose.Schema(
  {
    userEmail: String,

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    title: String,

    message: String,

    type: {
      type: String,
      default: "review",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
const getNextInvoiceNumber = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const lastOrder = await Order.findOne({
    createdAt: { $gte: startOfDay },
  }).sort({ createdAt: -1 });

  if (!lastOrder || !lastOrder.invoiceNumber) {
    return "INV-00001";
  }

  const lastNum = parseInt(lastOrder.invoiceNumber.replace("INV-", ""));
  const nextNum = lastNum + 1;

  return `INV-${String(nextNum).padStart(5, "0")}`;
};

app.get("/api/notifications/:email", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userEmail: req.params.email,
      isRead: false,
    }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

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
  // INVOICE SETTINGS SCHEMA & MODEL
const invoiceSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },

    sellerName: {
      type: String,
      default: "PatraPatrika Center",
    },

    sellerVatPan: {
      type: String,
      default: "000000",
    },

    sellerAddress: {
      type: String,
      default: "000000",
    },

    sellerPhone: {
      type: String,
      default: "000000",
    },

    sellerEmail: {
      type: String,
      default: "000000",
    },

    sellerWebsite: {
      type: String,
      default: "",
    },

    invoiceTitle: {
      type: String,
      default: "TAX INVOICE",
    },

    invoicePrefix: {
      type: String,
      default: "VAT",
    },

    vatRate: {
      type: Number,
      default: 13,
    },

    defaultBuyerVatPan: {
      type: String,
      default: "000000",
    },

    invoiceNote: {
      type: String,
      default: "",
    },

    declaration: {
      type: String,
      default: "",
    },

    footerText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const InvoiceSettings =
  mongoose.models.InvoiceSettings ||
  mongoose.model("InvoiceSettings", invoiceSettingsSchema);

const defaultInvoiceSettings = {
  key: "default",
  sellerName: "PatraPatrika Center",
  sellerVatPan: "000000",
  sellerAddress: "000000",
  sellerPhone: "000000",
  sellerEmail: "000000",
  sellerWebsite: "",
  invoiceTitle: "TAX INVOICE",
  invoicePrefix: "VAT",
  vatRate: 13,
  defaultBuyerVatPan: "000000",
  invoiceNote: "",
  declaration: "",
  footerText: "",
};

const seedInvoiceSettings = async () => {
  try {
    await InvoiceSettings.findOneAndUpdate(
      { key: "default" },
      {
        $setOnInsert: defaultInvoiceSettings,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    console.log("Invoice settings ready ✅");
  } catch (error) {
    console.error("Invoice settings seed error:", error.message);
  }
};

const getInvoiceSettingsDocument = async () => {
  let settings = await InvoiceSettings.findOne({ key: "default" });

  if (!settings) {
    settings = await InvoiceSettings.create(defaultInvoiceSettings);
  }

  return settings;
};

const cleanInvoiceSettingsPayload = (body = {}) => {
  return {
    sellerName: String(body.sellerName || "").trim(),
    sellerVatPan: String(body.sellerVatPan || "").trim(),
    sellerAddress: String(body.sellerAddress || "").trim(),
    sellerPhone: String(body.sellerPhone || "").trim(),
    sellerEmail: String(body.sellerEmail || "").trim(),
    sellerWebsite: String(body.sellerWebsite || "").trim(),
    invoiceTitle: String(body.invoiceTitle || "TAX INVOICE").trim(),
    invoicePrefix: String(body.invoicePrefix || "VAT").trim().toUpperCase(),
    vatRate: Number(body.vatRate || 0),
    defaultBuyerVatPan: String(body.defaultBuyerVatPan || "").trim(),
    invoiceNote: String(body.invoiceNote || "").trim(),
    declaration: String(body.declaration || "").trim(),
    footerText: String(body.footerText || "").trim(),
  };
};
const heroSchema = new mongoose.Schema(
  {
    backgroundImage: {
      type: String,
      default: "",
    },

    sliderImages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Hero =
  mongoose.models.Hero ||
  mongoose.model("Hero", heroSchema);
  const flashSaleSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },

    isEnabled: {
      type: Boolean,
      default: false,
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const FlashSaleSettings =
  mongoose.models.FlashSaleSettings ||
  mongoose.model("FlashSaleSettings", flashSaleSettingsSchema);

const getFlashSaleSettingsDocument = async () => {
  let settings = await FlashSaleSettings.findOne({ key: "default" });

  if (!settings) {
    settings = await FlashSaleSettings.create({
      key: "default",
      isEnabled: false,
      startsAt: null,
      endsAt: null,
    });
  }

  return settings;
};

const isGlobalFlashSaleActive = (settings, now = new Date()) => {
  if (!settings?.isEnabled) return false;
  if (!settings.startsAt || !settings.endsAt) return false;

  const startsAt = new Date(settings.startsAt);
  const endsAt = new Date(settings.endsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime())
  ) {
    return false;
  }

  return startsAt <= now && now < endsAt;
};

const cleanupExpiredGlobalFlashSale = async () => {
  const settings = await getFlashSaleSettingsDocument();
  const now = new Date();

  if (
    settings.isEnabled &&
    settings.endsAt &&
    new Date(settings.endsAt) <= now
  ) {
    await Product.updateMany(
      {
        flashSale: true,
      },
      {
        $set: {
          flashSale: false,
          salePrice: null,
          flashSaleStartsAt: null,
          flashSaleExpiresAt: null,
        },
      }
    );

    settings.isEnabled = false;

    await settings.save();
  }

  return settings;
};

const hideInactiveSaleFieldsForCustomer = (product, flashSaleSettings) => {
  const item =
    typeof product.toObject === "function" ? product.toObject() : product;

  const activeFlashSale = isGlobalFlashSaleActive(flashSaleSettings);

  item.globalFlashSale = {
    isEnabled: Boolean(flashSaleSettings?.isEnabled),
    isActive: activeFlashSale,
    startsAt: flashSaleSettings?.startsAt || null,
    endsAt: flashSaleSettings?.endsAt || null,
  };

  if (!activeFlashSale) {
    item.flashSale = false;
    item.salePrice = null;
    item.flashSaleStartsAt = flashSaleSettings?.startsAt || null;
    item.flashSaleExpiresAt = flashSaleSettings?.endsAt || null;

    return item;
  }

  if (item.flashSale) {
    item.flashSaleStartsAt = flashSaleSettings?.startsAt || null;
    item.flashSaleExpiresAt = flashSaleSettings?.endsAt || null;
  }

  return item;
};
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

    console.log("Policy pages ready âœ…");
  } catch (error) {
    console.error("Policy seed error:", error.message);
  }
};
const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail || data?.message || data?.error || "Gateway API error"
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const khaltiRequest = async (endpoint, payload) => {
  if (!process.env.KHALTI_SECRET_KEY) {
    throw new Error("KHALTI_SECRET_KEY is missing in backend .env file");
  }

  return fetchJson(`${KHALTI_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

const createEsewaSignature = ({ totalAmount, transactionUuid, productCode }) => {
  if (!process.env.ESEWA_SECRET_KEY) {
    throw new Error("ESEWA_SECRET_KEY is missing in backend .env file");
  }

  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  return crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY.trim())
    .update(message)
    .digest("base64");
};

const stripeRequest = async (endpoint, params, method = "POST") => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing in backend .env file");
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
  };

  if (method === "POST") {
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = params;
  }

  return fetchJson(`https://api.stripe.com/v1${endpoint}`, options);
};

// ADMIN SEED FUNCTION
const seedAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await AdminModel.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await AdminModel.create({ email: adminEmail, password: hashedPassword });
      console.log("Admin account created in your MongoDB âœ…");
      return;
    }

    let passwordMatches = false;

    try {
      passwordMatches = await bcrypt.compare(
        adminPassword,
        existingAdmin.password
      );
    } catch {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("Admin password updated in your MongoDB âœ…");
      return;
    }

    console.log("Admin account already exists âœ…");
  } catch (error) {
    console.error("Admin seed error:", error.message);
  }
};

app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

// AUTH ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// POLICY ROUTES
app.get("/api/policies", async (req, res) => {
  try {
    const policies = await Policy.find({}).sort({ key: 1 });

    res.status(200).json({
      success: true,
      policies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/policies/:key", async (req, res) => {
  try {
    const policy = await Policy.findOne({ key: req.params.key });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/api/admin/policies/:key", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const updatedPolicy = await Policy.findOneAndUpdate(
      { key: req.params.key },
      {
        title,
        content,
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// INVOICE SETTINGS ROUTES
app.get("/api/invoice-settings", async (req, res) => {
  try {
    const settings = await getInvoiceSettingsDocument();

    res.status(200).json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    console.error("Fetch invoice settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/admin/invoice-settings", async (req, res) => {
  try {
    const settings = await getInvoiceSettingsDocument();

    res.status(200).json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    console.error("Admin fetch invoice settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/api/admin/invoice-settings", async (req, res) => {
  try {
    const payload = cleanInvoiceSettingsPayload(req.body);

    if (!payload.sellerName) {
      return res.status(400).json({
        success: false,
        error: "Seller name is required",
      });
    }

    if (!payload.sellerVatPan) {
      return res.status(400).json({
        success: false,
        error: "VAT/PAN number is required",
      });
    }

    if (!payload.sellerAddress) {
      return res.status(400).json({
        success: false,
        error: "Seller address is required",
      });
    }

    if (!payload.sellerPhone) {
      return res.status(400).json({
        success: false,
        error: "Seller phone is required",
      });
    }

    if (!payload.sellerEmail) {
      return res.status(400).json({
        success: false,
        error: "Seller email is required",
      });
    }

    if (!Number.isFinite(payload.vatRate) || payload.vatRate < 0) {
      return res.status(400).json({
        success: false,
        error: "VAT rate must be a valid positive number",
      });
    }

    const updatedSettings = await InvoiceSettings.findOneAndUpdate(
      { key: "default" },
      {
        $set: payload,
        $setOnInsert: {
          key: "default",
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    res.status(200).json({
      success: true,
      message: "Invoice settings updated successfully",
      settings: updatedSettings,
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Update invoice settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// HERO SETTINGS
/* ADD THIS */
app.get("/api/admin/hero", async (req, res) => {
  try {
    let hero = await Hero.findOne();

    if (!hero) {
      hero = await Hero.create({
        backgroundImage: "",
        sliderImages: [],
      });
    }

    res.json(hero);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
/* END */

app.put("/api/admin/hero", async (req, res) => {
  try {
    let backgroundImage = "";
    let sliderImages = [];

    if (req.files?.backgroundImage) {
      const file = req.files.backgroundImage;

      const uploaded = await imagekit.upload({
        file: `data:${file.mimetype};base64,${file.data.toString("base64")}`,
        fileName: file.name,
        folder: "/hero",
      });

      backgroundImage = uploaded.url;
    }

    for (let i = 1; i <= 3; i++) {
      const image = req.files?.[`slider${i}`];

      if (image) {
        const uploaded = await imagekit.upload({
          file: `data:${image.mimetype};base64,${image.data.toString("base64")}`,
          fileName: image.name,
          folder: "/hero",
        });

        sliderImages.push(uploaded.url);
      }
    }

    const hero = await Hero.findOneAndUpdate(
      {},
      {
        backgroundImage,
        sliderImages,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(hero);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
const isTruthy = (value) => {
  return (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1 ||
    value === "on"
  );
};

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const getNullableNumber = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = String(value).trim();

  if (trimmedValue === "") {
    return null;
  }

  const numberValue = Number(trimmedValue);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const buildFlashSalePayload = ({
  body = {},
  price = 0,
  existingProduct = null,
}) => {
  const flashSale =
    body.flashSale !== undefined
      ? isTruthy(body.flashSale)
      : Boolean(existingProduct?.flashSale);

  if (!flashSale) {
    return {
      flashSale: false,
      salePrice: null,
      flashSaleStartsAt: null,
      flashSaleExpiresAt: null,
    };
  }

  const salePrice =
    body.salePrice !== undefined
      ? getNullableNumber(body.salePrice)
      : getNullableNumber(existingProduct?.salePrice);

  if (salePrice === null || salePrice < 0) {
    throw createBadRequestError(
      "Sale price is required when Flash Sale is enabled."
    );
  }

  if (!(salePrice < price)) {
    throw createBadRequestError(
      "Sale price must be less than the actual price."
    );
  }
  return {
    flashSale: true,
    salePrice,
    flashSaleStartsAt: null,
    flashSaleExpiresAt: null,
  };
};
const deactivateExpiredFlashSales = async () => {
  return await cleanupExpiredGlobalFlashSale();
};

app.get("/api/flash-sale-settings", async (req, res) => {
  try {
    const settings = await cleanupExpiredGlobalFlashSale();

    res.status(200).json({
      success: true,
      settings: {
        isEnabled: Boolean(settings.isEnabled),
        isActive: isGlobalFlashSaleActive(settings),
        startsAt: settings.startsAt,
        endsAt: settings.endsAt,
      },
    });
  } catch (error) {
    console.error("Fetch flash sale settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/admin/flash-sale-settings", async (req, res) => {
  try {
    const settings = await getFlashSaleSettingsDocument();

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Admin fetch flash sale settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/api/admin/flash-sale-settings", async (req, res) => {
  try {
    const isEnabled = isTruthy(req.body.isEnabled);
    const startsAtInput = req.body.startsAt;
    const endsAtInput = req.body.endsAt;

    const settings = await getFlashSaleSettingsDocument();

    if (!isEnabled) {
      settings.isEnabled = false;
      await settings.save();

      return res.status(200).json({
        success: true,
        message: "Flash sale schedule disabled",
        settings,
      });
    }

    if (!startsAtInput || !endsAtInput) {
      return res.status(400).json({
        success: false,
        message: "Start date/time and end date/time are required.",
      });
    }

    const startsAt = new Date(startsAtInput);
    const endsAt = new Date(endsAtInput);

    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid flash sale start or end date/time.",
      });
    }

    if (endsAt <= startsAt) {
      return res.status(400).json({
        success: false,
        message: "Flash sale end time must be after start time.",
      });
    }

    if (endsAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Flash sale end time must be in the future.",
      });
    }

    settings.isEnabled = true;
    settings.startsAt = startsAt;
    settings.endsAt = endsAt;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Flash sale schedule saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Update flash sale settings error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// PRODUCT ROUTES
app.get("/api/products", async (req, res) => {
  try {
    const flashSaleSettings = await deactivateExpiredFlashSales();

    const query = {};
    const isAdminView = req.query.admin === "true";
    const activeFlashSale = isGlobalFlashSaleActive(flashSaleSettings);

    if (req.query.featured === "true") {
      query.featured = true;
    }

    if (req.query.flashSale === "true") {
      if (!activeFlashSale && !isAdminView) {
        return res.status(200).json([]);
      }

      query.flashSale = true;
    }

    if (req.query.bestSeller === "true") {
      query.bestSeller = true;
    }

    if (req.query.newArrival === "true") {
      query.newArrival = true;
    }

    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    if (isAdminView) {
      return res.status(200).json(products);
    }

    const customerProducts = products.map((product) =>
      hideInactiveSaleFieldsForCustomer(product, flashSaleSettings)
    );

    res.status(200).json(customerProducts);
  } catch (error) {
    console.error("Fetch products error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});
app.get("/api/products/:id", async (req, res) => {
  try {
    const flashSaleSettings = await deactivateExpiredFlashSales();

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const customerProduct = hideInactiveSaleFieldsForCustomer(
      product,
      flashSaleSettings
    );

    res.status(200).json(customerProduct);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});
app.get("/api/products/barcode/:barcode", async (req, res) => {
  try {

    const product = await Product.findOne({
      barcode: req.params.barcode.trim(),
    }).lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

app.post("/api/products/pos-checkout", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder = null;

    await session.withTransaction(async () => {
      const { cart, paymentMethod = "cash" } = req.body;

      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        const error = new Error("Cart is empty");
        error.statusCode = 400;
        throw error;
      }

      const quantityMap = new Map();

      cart.forEach((item) => {
        const productId = item._id || item.productId || item.id;
        const quantity = Number(item.quantity || item.qty || 1);

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
          const error = new Error("Invalid product in POS cart");
          error.statusCode = 400;
          throw error;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
          const error = new Error("Invalid product quantity in POS cart");
          error.statusCode = 400;
          throw error;
        }

        const previousQty = quantityMap.get(String(productId)) || 0;
        quantityMap.set(String(productId), previousQty + quantity);
      });

      const productIds = [...quantityMap.keys()];

      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      const productMap = new Map(
        productsFromDb.map((product) => [String(product._id), product])
      );
      
      console.log("================================");
      console.log("PRODUCT IDS FROM CART:", productIds);
      console.log(
        "PRODUCT IDS FOUND IN DB:",
        productsFromDb.map((p) => String(p._id))
      );
      console.log("================================");
      
      for (const productId of productIds) {
        const product = productMap.get(productId);
        const requiredQty = Number(stockRequiredMap.get(productId) || 0);
      
        console.log("CHECKING PRODUCT:", productId);
        console.log("FOUND IN DB:", !!product);
      
        if (!product) {
          console.log("❌ MISSING PRODUCT:", productId);
      
          const error = new Error("One or more products were not found.");
          error.statusCode = 404;
          throw error;
        }

        if (availableStock < requiredQty) {
          const error = new Error(
            `Only ${availableStock} stock available for "${product.name}"`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const orderItems = productIds.map((productId) => {
        const product = productMap.get(productId);
        const qty = Number(quantityMap.get(productId) || 0);
        const price =
  Number(product.salePrice) > 0
    ? Number(product.salePrice)
    : Number(product.price || 0);

        return {
          productId: product._id,
          title: product.name,
          image: product.image || "",
          qty,
          price,
          subtotal: Math.round(price * qty * 100) / 100,
        };
      });

      const productSubtotal = Math.round(
        orderItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) *
          100
      ) / 100;

      const vatRate = 13;

      const taxableAmount =
        Math.round((productSubtotal / (1 + vatRate / 100)) * 100) / 100;

      const vatAmount =
        Math.round((productSubtotal - taxableAmount) * 100) / 100;

      const grandTotal = productSubtotal;

      const stockOperations = productIds.map((productId) => {
        const product = productMap.get(productId);
        const requiredQty = Number(quantityMap.get(productId) || 0);

        const currentStock = Number(product.stock || 0);
        const newStock = currentStock - requiredQty;
        const lowStockAlert = Number(product.lowStockAlert || 5);

        const newStockStatus =
          newStock <= 0
            ? "Out of Stock"
            : newStock <= lowStockAlert
            ? "Low Stock"
            : "In Stock";

        const newStatusFlag = newStock <= 0 ? "Out of Stock" : "In Stock";

        const price =
  Number(product.salePrice) > 0
    ? Number(product.salePrice)
    : Number(product.price || 0);

        return {
          updateOne: {
            filter: {
              _id: product._id,
              stock: { $gte: requiredQty },
            },
            update: {
              $inc: {
                stock: -requiredQty,
                sold: requiredQty,
                totalRevenue: price * requiredQty,
              },
              $set: {
                stockStatus: newStockStatus,
                statusFlag: newStatusFlag,
                lastSoldAt: new Date(),
              },
            },
          },
        };
      });

      const stockResult = await Product.bulkWrite(stockOperations, {
        session,
      });

      if (stockResult.modifiedCount !== stockOperations.length) {
        const error = new Error(
          "Stock update failed. Product stock may have changed. Please try again."
        );
        error.statusCode = 400;
        throw error;
      }

      const orderDocs = await Order.create(
        [
          {
            email: "pos@system.com",
            customerName: "Walk-in Customer",
            phone: "POS Sale",

            deliveryInfo: {
              fullName: "Walk-in Customer",
              phone: "POS Sale",
              region: "Store",
              city: "Store",
              building: "Physical Store",
              area: "POS Counter",
              address: "In-store purchase",
              label: "Store",
            },

            orderItems,

            productSubtotal,
            deliveryCharge: 0,
            deliveryDistanceKm: 0,
            estimatedDelivery: "In-store purchase",

            taxableAmount,
            vatRate,
            vatAmount,
            grandTotal,
            totalPrice: grandTotal,

            checkoutType: "Cart",
            paymentMethod:
              paymentMethod === "card" ? "Card" : "Cash",
            paymentMethodId: paymentMethod,
            paymentGateway: "pos",

            paymentStatus: "Paid",
            orderStatus: "Completed",
            status: "Completed",

            transactionId: `POS-${Date.now()}`,
            paymentProof: "",

            paidAt: new Date(),

            trackingSteps: [
              {
                title: "POS Sale Completed",
                completed: true,
                date: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      createdOrder = orderDocs[0];
    });

    return res.status(201).json({
      success: true,
      message: "POS sale completed successfully",
      orderId: createdOrder._id,
      order: createdOrder,
    });
  } catch (error) {
    console.error("POS CHECKOUT ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: "Checkout failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

app.post("/api/products", async (req, res) => {
  try {
    let imageUrl = "";

    if (req.files && req.files.image) {
      const file = req.files.image;

      const base64File = `data:${file.mimetype};base64,${file.data.toString(
        "base64"
      )}`;

      const uploadResponse = await imagekit.upload({
        file: base64File,
        fileName: file.name,
        folder: "/bookstore-products",
      });

      imageUrl = uploadResponse.url;
    }

    const name = String(req.body.name || "").trim();
    const category = String(req.body.category || "").trim();
    const subcategory = String(req.body.subcategory || "General").trim();
    const description = String(req.body.description || "").trim();

    const price = Number(req.body.price || 0);

    if (!name) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Valid product price is required",
      });
    }

    const stockValue = Number(req.body.stock || 0);

    const flashSalePayload = buildFlashSalePayload({
      body: req.body,
      price,
    });

    const barcode = crypto.randomBytes(6).toString("hex");
    const sku = uuidv4().slice(0, 8).toUpperCase();

    const requestedStockStatus = req.body.stockStatus || "In Stock";

    const product = new Product({
      name,
      category,
      subcategory,
      description,

      image: imageUrl || undefined,

      price,
      salePrice: flashSalePayload.salePrice,

      barcode,
      sku,

      stock: stockValue,
      sold: 0,

      stockStatus:
        stockValue <= 0 ? "Out of Stock" : requestedStockStatus,

      statusFlag:
        stockValue <= 0 ? "Out of Stock" : requestedStockStatus,

      featured: isTruthy(req.body.featured),
      flashSale: flashSalePayload.flashSale,
      bestSeller: isTruthy(req.body.bestSeller),
      newArrival: isTruthy(req.body.newArrival),

      flashSaleStartsAt: flashSalePayload.flashSaleStartsAt,
      flashSaleExpiresAt: flashSalePayload.flashSaleExpiresAt,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:");
    console.error(error);

    res.status(error.statusCode || 500).json({
      message: error.message,
      stack: error.stack,
    });
  }
});
app.put("/api/products/:id", async (req, res) => {
  try {
    await deactivateExpiredFlashSales();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid product ID",
      });
    }

    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const updateData = {};

    const stringFields = [
      "name",
      "category",
      "subcategory",
      "description",
    ];

    stringFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = String(req.body[field] || "").trim();
      }
    });

    const finalPrice =
      req.body.price !== undefined
        ? Number(req.body.price || 0)
        : Number(existingProduct.price || 0);

    if (!Number.isFinite(finalPrice) || finalPrice < 0) {
      return res.status(400).json({
        message: "Valid product price is required",
      });
    }

    if (req.body.price !== undefined) {
      updateData.price = finalPrice;
    }

    if (req.body.stock !== undefined) {
      const stockValue = Number(req.body.stock || 0);

      updateData.stock = stockValue;

      const requestedStockStatus =
        req.body.stockStatus ||
        existingProduct.stockStatus ||
        "In Stock";

      updateData.stockStatus =
        stockValue <= 0 ? "Out of Stock" : requestedStockStatus;

      updateData.statusFlag = updateData.stockStatus;
    } else if (req.body.stockStatus !== undefined) {
      updateData.stockStatus = req.body.stockStatus;
      updateData.statusFlag = req.body.stockStatus;
    }

    const flashSalePayload = buildFlashSalePayload({
      body: req.body,
      price: finalPrice,
      existingProduct,
    });

    updateData.salePrice = flashSalePayload.salePrice;
    updateData.flashSale = flashSalePayload.flashSale;
    updateData.flashSaleStartsAt = flashSalePayload.flashSaleStartsAt;
    updateData.flashSaleExpiresAt = flashSalePayload.flashSaleExpiresAt;

    const booleanFields = [
      "featured",
      "bestSeller",
      "newArrival",
    ];

    booleanFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = isTruthy(req.body[field]);
      }
    });

    if (req.files && req.files.image) {
      const file = req.files.image;

      const base64File = `data:${file.mimetype};base64,${file.data.toString(
        "base64"
      )}`;

      const uploadResponse = await imagekit.upload({
        file: base64File,
        fileName: file.name,
        folder: "/bookstore-products",
      });

      updateData.image = uploadResponse.url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("PRODUCT UPDATE ERROR:");
    console.error(error);

    res.status(error.statusCode || 500).json({
      message: error.message,
      stack: error.stack,
    });
  }
});
app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const { name, email, rating, comment, orderId } = req.body;

    if (!name || !email || !rating || !comment || !orderId) {
      return res.status(400).json({
        error: "Name, email, rating, comment, and orderId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid product ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: "Invalid order ID",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const completedOrder = await Order.findOne({
      _id: orderId,

      email: {
        $regex: `^${escapeRegex(cleanEmail)}$`,
        $options: "i",
      },

      orderStatus: {
        $in: ["Delivered", "Completed"],
      },

      orderItems: {
        $elemMatch: {
          productId: product._id,
        },
      },
    });

    if (!completedOrder) {
      return res.status(403).json({
        error:
          "You can review this product only after this order is delivered or completed.",
      });
    }

    const alreadyReviewedThisOrder = product.reviews.find((review) => {
      const reviewEmail = String(review.email || "").toLowerCase().trim();

      return (
        reviewEmail === cleanEmail &&
        review.orderId &&
        String(review.orderId) === String(completedOrder._id)
      );
    });

    if (alreadyReviewedThisOrder) {
      return res.status(409).json({
        error: "You have already reviewed this product for this order.",
      });
    }

    product.reviews.push({
      orderId: completedOrder._id,
      name: String(name).trim(),
      email: cleanEmail,
      rating: numericRating,
      comment: String(comment).trim(),
    });

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce(
        (total, review) => total + Number(review.rating || 0),
        0
      ) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      product,
    });
  } catch (error) {
    console.error("Review submit error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.patch("/api/products/:id", async (req, res) => {
  try {
    const { stockStatus } = req.body;

    if (!stockStatus) {
      return res.status(400).json({
        error: "stockStatus is required",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        stockStatus,
        statusFlag: stockStatus,
      },
      {
        returnDocument: "after",
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// DELIVERY CALCULATION ROUTE
app.post("/api/delivery/calculate", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const customerLat = Number(lat);
    const customerLng = Number(lng);

    if (!Number.isFinite(customerLat) || !Number.isFinite(customerLng)) {
      return res.status(400).json({
        success: false,
        error: "Valid latitude and longitude are required",
      });
    }

    const delivery = calculateDelivery({
      lat: customerLat,
      lng: customerLng,
    });

    return res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    console.error("Delivery calculation error:", error);

    return res.status(400).json({
      success: false,
      error: error.message || "Failed to calculate delivery",
    });
  }
});

// ORDER CREATE ROUTE
app.post("/api/orders", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let createdOrder = null;

    await session.withTransaction(async () => {
      const {
        email,
        customerName,
        phone,
        deliveryInfo,
        orderItems,
        productSubtotal,
        deliveryCharge,
        taxableAmount,
        vatRate,
        vatAmount,
        grandTotal,
        totalPrice,
        checkoutType,
        paymentMethod,
        paymentMethodId,
        paymentStatus,
        orderStatus,
        transactionId,
        paymentProof,
      } = req.body;

      if (!email || !customerName || !phone) {
        const error = new Error("Customer name, email, and phone are required");
        error.statusCode = 400;
        throw error;
      }

      if (!deliveryInfo) {
        const error = new Error("Delivery information is required");
        error.statusCode = 400;
        throw error;
      }

      if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        const error = new Error("Order must contain at least one product");
        error.statusCode = 400;
        throw error;
      }

      const cleanedItems = orderItems.map((item) => {
        const qty = Number(item.qty || item.quantity || 1);
        const price = Number(item.price || 0);
        const rawProductId = item.productId || item._id || item.id || "";

        return {
          productId:
            rawProductId && mongoose.Types.ObjectId.isValid(rawProductId)
              ? rawProductId
              : undefined,
          title: item.title || item.name || "Product",
          image: item.image || "",
          qty,
          price,
          subtotal: roundMoney(price * qty),
        };
      });

      for (const item of cleanedItems) {
        if (!item.productId) {
          const error = new Error(
            `Product ID missing for "${item.title}". Cannot update stock.`
          );
          error.statusCode = 400;
          throw error;
        }

        if (!Number.isFinite(item.qty) || item.qty <= 0) {
          const error = new Error(`Invalid quantity for "${item.title}".`);
          error.statusCode = 400;
          throw error;
        }
      }

      const stockRequiredMap = new Map();

      cleanedItems.forEach((item) => {
        const productId = String(item.productId);
        const previousQty = stockRequiredMap.get(productId) || 0;
        stockRequiredMap.set(productId, previousQty + Number(item.qty || 0));
      });

      const productIds = [...stockRequiredMap.keys()];

      const productsFromDb = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      const productMap = new Map(
        productsFromDb.map((product) => [String(product._id), product])
      );

      for (const productId of productIds) {
        const product = productMap.get(productId);
        const requiredQty = Number(stockRequiredMap.get(productId) || 0);

        if (!product) {
          const error = new Error("One or more products were not found.");
          error.statusCode = 404;
          throw error;
        }

        const availableStock = Number(product.stock || 0);

        if (availableStock <= 0) {
          const error = new Error(`"${product.name}" is out of stock.`);
          error.statusCode = 400;
          throw error;
        }

        if (availableStock < requiredQty) {
          const error = new Error(
            `Only ${availableStock} stock available for "${product.name}".`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const calculatedProductSubtotal = roundMoney(
        cleanedItems.reduce(
          (total, item) => total + Number(item.subtotal || 0),
          0
        )
      );

      const finalProductSubtotal =
        Number(productSubtotal || 0) || calculatedProductSubtotal;

      let distanceKm = 0;

      const region = deliveryInfo?.region?.toLowerCase() || "";
      const city = deliveryInfo?.city?.toLowerCase() || "";

      if (
        region.includes("hetauda") ||
        region.includes("makwanpur") ||
        city.includes("hetauda")
      ) {
        distanceKm = 10;
      } else if (
        region.includes("chitwan") ||
        region.includes("bharatpur")
      ) {
        distanceKm = 90;
      } else if (
        region.includes("kathmandu") ||
        region.includes("lalitpur") ||
        region.includes("bhaktapur")
      ) {
        distanceKm = 140;
      } else if (
        region.includes("pokhara") ||
        region.includes("dharan") ||
        region.includes("butwal")
      ) {
        distanceKm = 250;
      } else {
        distanceKm = 500;
      }

      const deliveryData = calculateDelivery(distanceKm);

           const finalDeliveryCharge =
        Number(deliveryCharge || 0) || Number(deliveryData.charge || 0);

      const finalTaxableAmount =
        Number(taxableAmount || 0) ||
        roundMoney(finalProductSubtotal + finalDeliveryCharge);

      const finalVatRate = Number(vatRate ?? 13);

      const finalVatAmount =
        Number(vatAmount || 0) ||
        roundMoney((finalTaxableAmount * finalVatRate) / 100);

      const finalGrandTotal =
        Number(grandTotal || totalPrice || 0) ||
        roundMoney(finalTaxableAmount + finalVatAmount);

      const selectedPaymentMethod = paymentMethod || "Cash on Delivery";
      const selectedPaymentMethodId = paymentMethodId || "cod";

      const orderDocs = await Order.create(
        [
          {
            email: String(email).toLowerCase().trim(),

            customerName,

            phone,

            deliveryInfo,

            orderItems: cleanedItems,

            productSubtotal: finalProductSubtotal,

            deliveryCharge: finalDeliveryCharge,

            taxableAmount: finalTaxableAmount,

            vatRate: finalVatRate,

            vatAmount: finalVatAmount,

            grandTotal: finalGrandTotal,

            totalPrice: finalGrandTotal,

            checkoutType: checkoutType || "Cart",

            paymentMethod: selectedPaymentMethod,

            paymentMethodId: selectedPaymentMethodId,

            paymentGateway: selectedPaymentMethodId,

            paymentStatus: paymentStatus || "Pending",

            orderStatus: orderStatus || "Processing",

            status: "Processing",

                        trackingSteps: makeTrackingSteps(orderStatus || "Processing"),

            estimatedDelivery: deliveryData.days,

            transactionId: transactionId || "",

            paymentProof: paymentProof || "",
          },
        ],
        { session }
      );

      createdOrder = orderDocs[0];

      const stockBulkOperations = productIds.map((productId) => {
        const product = productMap.get(productId);
        const requiredQty = Number(stockRequiredMap.get(productId) || 0);

        const currentStock = Number(product.stock || 0);
        const newStock = currentStock - requiredQty;
        const lowStockAlert = Number(product.lowStockAlert || 5);

        const newStockStatus =
          newStock <= 0
            ? "Out of Stock"
            : newStock <= lowStockAlert
            ? "Low Stock"
            : "In Stock";

        const newStatusFlag = newStock <= 0 ? "Out of Stock" : "In Stock";

        return {
          updateOne: {
            filter: {
              _id: product._id,
              stock: { $gte: requiredQty },
            },
            update: {
              $inc: {
                stock: -requiredQty,
                sold: requiredQty,
                totalRevenue: Number(product.price || 0) * requiredQty,
              },
              $set: {
                stockStatus: newStockStatus,
                statusFlag: newStatusFlag,
                lastSoldAt: new Date(),
              },
            },
          },
        };
      });

      const stockUpdateResult = await Product.bulkWrite(stockBulkOperations, {
        session,
      });

      if (stockUpdateResult.modifiedCount !== stockBulkOperations.length) {
        const error = new Error(
          "Stock update failed. Please try again because product stock may have changed."
        );
        error.statusCode = 400;
        throw error;
      }
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully and stock updated",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    res.status(error.statusCode || 400).json({
      success: false,
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

// GET ALL ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,

      // compatibility
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET ORDERS BY CUSTOMER EMAIL
app.get("/api/orders/customer/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "")
      .toLowerCase()
      .trim();

    const orders = await Order.find({
      email: {
        $regex: `^${escapeRegex(email)}$`,
        $options: "i",
      },
    }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      orders,

      // compatibility
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// USER ORDER ROUTE ALIAS
// IMPORTANT: keep this ABOVE /api/orders/:id
app.get("/api/orders/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "")
      .toLowerCase()
      .trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "User email is required",
      });
    }

    const orders = await Order.find({
      email: {
        $regex: `^${escapeRegex(email)}$`,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    // some of your old frontend pages expect direct array
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch user orders error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET SINGLE ORDER
// IMPORTANT: this must stay BELOW /api/orders/user/:email
app.get("/api/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,

      // compatibility
      data: order,
    });
  } catch (error) {
    console.error("Fetch single order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// COMMON ORDER STATUS UPDATE FUNCTION
const updateOrderStatusHandler = async (req, res) => {
  try {
    const { orderStatus, status, paymentStatus, deliveryPartner } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const oldOrderStatus = normalizeOrderStatus(
      order.orderStatus || order.status || "Processing"
    );

    const requestedOrderStatus = orderStatus || status;

    if (requestedOrderStatus !== undefined) {
      const finalOrderStatus = normalizeOrderStatus(requestedOrderStatus);

      if (!finalOrderStatus) {
        return res.status(400).json({
          success: false,
          error: "Invalid order status",
          allowedStatuses: ORDER_STATUSES,
        });
      }

      order.orderStatus = finalOrderStatus;
      order.status = finalOrderStatus;

      if (
        finalOrderStatus !== "Cancelled" &&
        finalOrderStatus !== "Failed Delivery"
      ) {
        order.trackingSteps = makeTrackingSteps(finalOrderStatus);
      }

      order.deliveryLastUpdatedAt = new Date();

      if (finalOrderStatus === "Cancelled") {
        order.cancelledAt = order.cancelledAt || new Date();
        order.cancelledBy = order.cancelledBy || "admin";
        order.cancelReason = order.cancelReason || "Cancelled by admin";
      }
    } else {
      const safeCurrentStatus = oldOrderStatus || "Processing";

      order.orderStatus = safeCurrentStatus;
      order.status = safeCurrentStatus;
    }

    if (paymentStatus !== undefined) {
      const finalPaymentStatus = normalizePaymentStatus(paymentStatus);

      if (!finalPaymentStatus) {
        return res.status(400).json({
          success: false,
          error: "Invalid payment status",
          allowedStatuses: PAYMENT_STATUSES,
        });
      }

      order.paymentStatus = finalPaymentStatus;

      if (finalPaymentStatus === "Paid" && !order.paidAt) {
        order.paidAt = new Date();
      }

      if (finalPaymentStatus === "Pending") {
        order.paidAt = null;
      }
    }

        if (deliveryPartner && typeof deliveryPartner === "object") {
      order.deliveryPartner = {
        name: String(deliveryPartner.name || "").trim(),
        phone: String(deliveryPartner.phone || "").trim(),
        company: String(deliveryPartner.company || "").trim(),
        trackingNumber: String(deliveryPartner.trackingNumber || "").trim(),
        note: String(deliveryPartner.note || "").trim(),
      };

      const hasDeliveryPartnerInfo =
        order.deliveryPartner.name ||
        order.deliveryPartner.phone ||
        order.deliveryPartner.company ||
        order.deliveryPartner.trackingNumber;

      if (hasDeliveryPartnerInfo) {
  if (!order.deliveryUpdateToken) {
    issueDeliveryUpdateToken(order);
  } else {
    ensureDeliveryUpdateTokenExpiry(order);
  }
}

      order.deliveryLastUpdatedAt = new Date();
    }

    const updatedOrder = await order.save();

    const becameDeliveredOrCompleted =
      !["Delivered", "Completed"].includes(oldOrderStatus) &&
      ["Delivered", "Completed"].includes(updatedOrder.orderStatus);

    if (becameDeliveredOrCompleted) {
      for (const item of updatedOrder.orderItems || []) {
        if (!item.productId) continue;

        await Notification.create({
          userEmail: updatedOrder.email,
          orderId: updatedOrder._id,
          productId: item.productId,
          title: "Delivery Completed",
          message:
            "Your order has been delivered successfully. You can now review your product.",
          type: "review",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", updateOrderStatusHandler);
app.put("/api/orders/:id/status", updateOrderStatusHandler);

// ADMIN STATUS ROUTE ALIAS
app.patch("/api/admin/orders/:id/status", updateOrderStatusHandler);
app.put("/api/admin/orders/:id/status", updateOrderStatusHandler);
const regenerateDeliveryUpdateLinkHandler = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const hasDeliveryPartnerInfo =
      order.deliveryPartner?.name ||
      order.deliveryPartner?.phone ||
      order.deliveryPartner?.company ||
      order.deliveryPartner?.trackingNumber;

    if (!hasDeliveryPartnerInfo) {
      return res.status(400).json({
        success: false,
        error: "Save delivery partner details first before regenerating link.",
      });
    }

    issueDeliveryUpdateToken(order);
    order.deliveryLastUpdatedAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery update link regenerated successfully",
      order: updatedOrder,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Regenerate delivery update link error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

app.patch(
  "/api/orders/:id/delivery-link/regenerate",
  regenerateDeliveryUpdateLinkHandler
);

app.patch(
  "/api/admin/orders/:id/delivery-link/regenerate",
  regenerateDeliveryUpdateLinkHandler
);

// CANCEL ORDER
app.patch("/api/orders/:id/cancel", async (req, res) => {
  try {
    const { cancelledBy = "customer", cancelReason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const blockedStatuses = ["Completed", "Delivered", "Cancelled"];

    if (blockedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "Cancelled";
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = cancelledBy;
    order.cancelReason = cancelReason || "Cancelled by customer/admin";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,

      // compatibility
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ADMIN CANCEL ROUTE ALIAS
app.patch("/api/admin/orders/:id/cancel", async (req, res) => {
  try {
    const { cancelledBy = "admin", cancelReason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const blockedStatuses = ["Completed", "Delivered", "Cancelled"];

    if (blockedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because it is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "Cancelled";
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = cancelledBy;
    order.cancelReason = cancelReason || "Cancelled by admin";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
      data: order,
    });
  } catch (error) {
    console.error("Admin cancel order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE ORDER
app.delete("/api/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ADMIN DELETE ROUTE ALIAS
app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ADMIN DASHBOARD STATS
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: {
              $ifNull: ["$grandTotal", "$totalPrice"],
            },
          },
        },
      },
    ]);

    const pendingOrders = await Order.countDocuments({
      orderStatus: {
        $in: ["Processing", "Confirmed", "Pending", "pending"],
      },
    });

    const lowStockProducts = await Product.countDocuments({
      $or: [
        {
          stock: {
            $lte: 5,
          },
        },
        {
          quantity: {
            $lte: 5,
          },
        },
        {
          stockStatus: "Low Stock",
        },
      ],
    });

    const totalRevenue = revenueResult[0]?.revenue || 0;

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalMessages,
      totalRevenue,
      revenue: totalRevenue,
      pendingOrders,
      lowStockProducts,
    };

    res.status(200).json({
      success: true,

      // new format
      stats,

      // old frontend compatibility
      totalProducts,
      totalOrders,
      totalUsers,
      totalMessages,
      totalRevenue,
      revenue: totalRevenue,
      pendingOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// ADMIN DASHBOARD STATS
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const pendingOrders = await Order.countDocuments({
      orderStatus: {
        $in: ["Processing", "Confirmed"],
      },
    });

    const lowStockProducts = await Product.countDocuments({
      $or: [
        {
          stock: {
            $lte: 5,
          },
        },
        {
          stockStatus: "Low Stock",
        },
      ],
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalMessages,
        totalRevenue: revenueResult[0]?.revenue || 0,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ADMIN REPORTS
app.get("/api/admin/reports", async (req, res) => {
  try {
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();

    const paidOrders = await Order.countDocuments({
      paymentStatus: "Paid",
    });

    const pendingOrders = await Order.countDocuments({
      paymentStatus: "Pending",
    });

    const cancelledOrders = await Order.countDocuments({
      orderStatus: "Cancelled",
    });

    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const paymentBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethodId",
          count: {
            $sum: 1,
          },
          amount: {
            $sum: "$grandTotal",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          orders: {
            $sum: 1,
          },
          revenue: {
            $sum: "$grandTotal",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: {
        totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
        totalOrders,
        paidOrders,
        pendingOrders,
        cancelledOrders,
        statusBreakdown,
        paymentBreakdown,
        monthlySales,
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PAYMENT HELPERS
const updateOrderPaymentSuccess = async ({
  order,
  paymentGateway,
  transactionId,
  gatewayResponse,
}) => {
  order.paymentStatus = "Paid";
  order.orderStatus = "Confirmed";
  order.status = "Confirmed";
  order.paymentGateway = paymentGateway;
  order.transactionId = transactionId || order.transactionId || "";
  order.gatewayResponse = gatewayResponse || null;
  order.paidAt = new Date();

  await order.save();

  return order;
};

const updateOrderPaymentFailed = async ({ order, paymentGateway, gatewayResponse }) => {
  order.paymentStatus = "Failed";
  order.paymentGateway = paymentGateway;
  order.gatewayResponse = gatewayResponse || null;

  await order.save();

  return order;
};

// KHALTI INITIATE
app.post("/api/payments/khalti/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const amount = toPaisa(order.grandTotal || order.totalPrice);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid order amount",
      });
    }

    const payload = {
      return_url: `${BACKEND_URL}/api/payments/khalti/verify?orderId=${order._id}`,
      website_url: FRONTEND_URL,
      amount,
      purchase_order_id: String(order._id),
      purchase_order_name: `Order ${order._id}`,
      customer_info: {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
      },
    };

    const khaltiResponse = await khaltiRequest("/epayment/initiate/", payload);

    order.khaltiPidx = khaltiResponse.pidx || "";
    order.khaltiPaymentUrl = khaltiResponse.payment_url || "";
    order.khaltiStatus = khaltiResponse.status || "";
    order.paymentGateway = "khalti";
    order.gatewayResponse = khaltiResponse;

    await order.save();

    res.status(200).json({
      success: true,
      payment_url: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
    });
  } catch (error) {
    console.error("Khalti initiate error:", error);

    res.status(500).json({
      success: false,
      error: error.data || error.message,
    });
  }
});

// KHALTI VERIFY
app.get("/api/payments/khalti/verify", async (req, res) => {
  try {
    const { pidx, orderId } = req.query;

    if (!pidx || !orderId) {
      return res.redirect(`${FRONTEND_URL}/my-orders?payment=failed`);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.redirect(`${FRONTEND_URL}/my-orders?payment=failed`);
    }

    const lookupResponse = await khaltiRequest("/epayment/lookup/", {
      pidx,
    });

    order.khaltiPidx = pidx;
    order.khaltiStatus = lookupResponse.status || "";
    order.gatewayResponse = lookupResponse;

    if (lookupResponse.status === "Completed") {
      await updateOrderPaymentSuccess({
        order,
        paymentGateway: "khalti",
        transactionId: lookupResponse.transaction_id || pidx,
        gatewayResponse: lookupResponse,
      });

      return res.redirect(`${FRONTEND_URL}/order-success?orderId=${order._id}`);
    }

    await updateOrderPaymentFailed({
      order,
      paymentGateway: "khalti",
      gatewayResponse: lookupResponse,
    });

    return res.redirect(`${FRONTEND_URL}/my-orders?payment=failed`);
  } catch (error) {
    console.error("Khalti verify error:", error);

    return res.redirect(`${FRONTEND_URL}/my-orders?payment=failed`);
  }
});
// ESEWA PAYMENT
app.post("/api/payments/esewa/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ error: "This order is already paid" });
    }

    const transactionUuid = `${order._id}-${Date.now()}`;

    const amountNumber = roundMoney(Number(order.productSubtotal || 0));
    const taxAmountNumber = roundMoney(Number(order.vatAmount || 0));
    const deliveryChargeNumber = roundMoney(Number(order.deliveryCharge || 0));
    const serviceChargeNumber = 0;

    const totalAmountNumber = roundMoney(
      amountNumber + taxAmountNumber + deliveryChargeNumber + serviceChargeNumber
    );

    const amount = String(amountNumber);
    const taxAmount = String(taxAmountNumber);
    const deliveryCharge = String(deliveryChargeNumber);
    const serviceCharge = String(serviceChargeNumber);
    const totalAmount = String(totalAmountNumber);

    const signature = createEsewaSignature({
      totalAmount,
      transactionUuid,
      productCode: ESEWA_PRODUCT_CODE,
    });

    const fields = {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: serviceCharge,
      product_delivery_charge: deliveryCharge,
      success_url: `${BACKEND_URL}/api/payments/esewa/success`,
      failure_url: `${BACKEND_URL}/api/payments/esewa/failure?orderId=${order._id}`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    order.paymentMethod = "eSewa";
    order.paymentMethodId = "esewa";
    order.paymentGateway = "esewa";
    order.paymentStatus = "Pending";
    order.esewaTransactionUuid = transactionUuid;
    order.esewaStatus = "Initiated";
    order.transactionId = transactionUuid;
    order.gatewayResponse = { fields };

    await order.save();

    res.status(200).json({
      success: true,
      formUrl: ESEWA_PAYMENT_URL,
      fields,
      order,
    });
  } catch (error) {
    console.error("eSewa initiate error:", error.message);

    res.status(400).json({
      success: false,
      error: error.message || "Failed to initiate eSewa payment",
    });
  }
});

app.get("/api/payments/esewa/success", async (req, res) => {
  let order = null;

  try {
    let decodedData = {};

    if (req.query.data) {
      const decodedText = Buffer.from(String(req.query.data), "base64").toString(
        "utf8"
      );

      decodedData = JSON.parse(decodedText);
    } else {
      decodedData = req.query;
    }

    const transactionUuid =
      decodedData.transaction_uuid || req.query.transaction_uuid;

    if (!transactionUuid) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=esewa&paymentStatus=failed`
      );
    }

    order = await Order.findOne({ esewaTransactionUuid: transactionUuid });

    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=esewa&paymentStatus=failed`
      );
    }

    let verifiedStatus = decodedData.status || "";

    try {
      const statusUrl = `${ESEWA_STATUS_CHECK_URL}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${order.totalPrice}&transaction_uuid=${transactionUuid}`;
      const statusData = await fetchJson(statusUrl, { method: "GET" });

      verifiedStatus =
        statusData.status ||
        statusData.transaction_status ||
        verifiedStatus ||
        "";

      order.gatewayResponse = {
        callback: decodedData,
        statusCheck: statusData,
      };
    } catch (statusError) {
      order.gatewayResponse = {
        callback: decodedData,
        statusCheckError: statusError.data || statusError.message,
      };
    }

    const normalizedStatus = String(verifiedStatus).toUpperCase();

    if (
      normalizedStatus === "COMPLETE" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "SUCCESS"
    ) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      order.status = "Confirmed";
      order.esewaStatus = verifiedStatus || "COMPLETE";
      order.esewaRefId =
        decodedData.transaction_code || decodedData.ref_id || "";
      order.transactionId =
        decodedData.transaction_code || decodedData.ref_id || transactionUuid;
      order.paidAt = new Date();
    } else {
      order.paymentStatus = "Verification Required";
      order.esewaStatus = verifiedStatus || "Unknown";
    }

    await order.save();

    const frontendStatus = order.paymentStatus === "Paid" ? "paid" : "pending";

    return res.redirect(
      `${FRONTEND_URL}/order-success?orderId=${order._id}&payment=esewa&paymentStatus=${frontendStatus}`
    );
  } catch (error) {
    console.error("eSewa success error:", error.message);

    if (order) {
      order.paymentStatus = "Failed";
      order.esewaStatus = "Failed";
      order.gatewayResponse = error.data || { error: error.message };
      await order.save();
    }

    return res.redirect(
      `${FRONTEND_URL}/order-success${
        order ? `?orderId=${order._id}&` : "?"
      }payment=esewa&paymentStatus=failed`
    );
  }
});

app.get("/api/payments/esewa/failure", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      const order = await Order.findById(orderId);

      if (order) {
        order.paymentStatus = "Failed";
        order.esewaStatus = "Failed";
        await order.save();
      }
    }

    return res.redirect(
      `${FRONTEND_URL}/order-success${
        orderId ? `?orderId=${orderId}&` : "?"
      }payment=esewa&paymentStatus=failed`
    );
  } catch {
    return res.redirect(
      `${FRONTEND_URL}/order-success?payment=esewa&paymentStatus=failed`
    );
  }
});

// CARD PAYMENT VIA STRIPE CHECKOUT
app.post("/api/payments/card/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ error: "This order is already paid" });
    }

    const params = new URLSearchParams();

    params.append("mode", "payment");
    params.append(
      "success_url",
      `${BACKEND_URL}/api/payments/card/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`
    );
    params.append(
      "cancel_url",
      `${BACKEND_URL}/api/payments/card/cancel?orderId=${order._id}`
    );
    params.append("client_reference_id", String(order._id));
    params.append("customer_email", order.email || "customer@example.com");

    params.append("line_items[0][quantity]", "1");
    params.append("line_items[0][price_data][currency]", STRIPE_CURRENCY);
    params.append(
      "line_items[0][price_data][unit_amount]",
      String(toPaisa(order.totalPrice))
    );
    params.append(
      "line_items[0][price_data][product_data][name]",
      `PatraPatrika Order ${String(order._id).slice(-8)}`
    );

    params.append("metadata[orderId]", String(order._id));

    const stripeSession = await stripeRequest(
      "/checkout/sessions",
      params,
      "POST"
    );

    order.paymentMethod = "Credit / Debit Card";
    order.paymentMethodId = "card";
    order.paymentGateway = "stripe";
    order.paymentStatus = "Pending";
    order.stripeSessionId = stripeSession.id || "";
    order.gatewayResponse = stripeSession;

    await order.save();

    res.status(200).json({
      success: true,
      payment_url: stripeSession.url,
      sessionId: stripeSession.id,
      order,
    });
  } catch (error) {
    console.error("Card/Stripe initiate error:", error.data || error.message);

    res.status(400).json({
      success: false,
      error: error.data || error.message || "Failed to initiate card payment",
    });
  }
});

app.get("/api/payments/card/success", async (req, res) => {
  let order = null;

  try {
    const { session_id, orderId } = req.query;

    if (!session_id || !orderId) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=card&paymentStatus=failed`
      );
    }

    order = await Order.findById(orderId);

    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=card&paymentStatus=failed`
      );
    }

    const stripeSession = await stripeRequest(
      `/checkout/sessions/${session_id}`,
      null,
      "GET"
    );

    order.gatewayResponse = stripeSession;
    order.stripeSessionId = stripeSession.id || session_id;
    order.stripePaymentIntentId = stripeSession.payment_intent || "";

    if (stripeSession.payment_status === "paid") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      order.status = "Confirmed";
      order.transactionId =
        stripeSession.payment_intent || stripeSession.id || session_id;
      order.paidAt = new Date();
    } else {
      order.paymentStatus = "Pending";
    }

    await order.save();

    const frontendStatus = order.paymentStatus === "Paid" ? "paid" : "pending";

    return res.redirect(
      `${FRONTEND_URL}/order-success?orderId=${order._id}&payment=card&paymentStatus=${frontendStatus}`
    );
  } catch (error) {
    console.error("Card/Stripe success error:", error.data || error.message);

    if (order) {
      order.paymentStatus = "Failed";
      order.gatewayResponse = error.data || { error: error.message };
      await order.save();
    }

    return res.redirect(
      `${FRONTEND_URL}/order-success${
        order ? `?orderId=${order._id}&` : "?"
      }payment=card&paymentStatus=failed`
    );
  }
});

app.get("/api/payments/card/cancel", async (req, res) => {
  try {
    const { orderId } = req.query;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      const order = await Order.findById(orderId);

      if (order) {
        order.paymentStatus = "Failed";
        await order.save();
      }
    }

    return res.redirect(
      `${FRONTEND_URL}/order-success${
        orderId ? `?orderId=${orderId}&` : "?"
      }payment=card&paymentStatus=failed`
    );
  } catch {
    return res.redirect(
      `${FRONTEND_URL}/order-success?payment=card&paymentStatus=failed`
    );
  }
});

// ADMIN: GET ALL ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER: GET ORDERS BY EMAIL
app.get("/api/orders/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || "")
      .toLowerCase()
      .trim();

    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }

    const orders = await Order.find({
      email: {
        $regex: `^${escapeRegex(email)}$`,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER: CANCEL ORDER
app.patch("/api/orders/:id/cancel", async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const currentOrderStatus = order.orderStatus || order.status || "Processing";
    const currentPaymentStatus = order.paymentStatus || "Pending";

    if (currentOrderStatus === "Cancelled") {
      return res.status(400).json({
        error: "This order is already cancelled",
      });
    }

    if (currentOrderStatus === "Confirmed") {
      return res.status(400).json({
        error:
          "This order has already been confirmed by admin and cannot be cancelled by user",
      });
    }

    if (currentOrderStatus === "Completed") {
      return res.status(400).json({
        error: "Completed order cannot be cancelled",
      });
    }

    if (currentPaymentStatus === "Paid") {
      return res.status(400).json({
        error:
          "Paid orders cannot be cancelled directly. Please contact admin for refund/cancellation.",
      });
    }

    order.orderStatus = "Cancelled";
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = "User";
    order.cancelReason = cancelReason || "Cancelled by customer";

    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Failed";
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET ONE ORDER
app.get("/api/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.body.orderStatus || req.body.status) {
      const newStatus = req.body.orderStatus || req.body.status;

      order.orderStatus = newStatus;
      order.status = newStatus;
    } else {
      const newStatus =
        order.status === "Processing" ? "Completed" : "Processing";

      order.status = newStatus;
      order.orderStatus = newStatus;
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE PAYMENT STATUS
app.patch("/api/orders/:id/payment", updateOrderStatusHandler);
// DELIVERY PARTNER LIMITED UPDATE ROUTES
const DELIVERY_LINK_STATUSES = [
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Failed Delivery",
];

app.get("/api/delivery-update/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Delivery update token is required",
      });
    }

    const order = await Order.findOne({
      deliveryUpdateToken: token,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Invalid or expired delivery update link",
      });
    }

    ensureDeliveryUpdateTokenExpiry(order);

    if (isDeliveryUpdateTokenExpired(order)) {
      await order.save();

      return res.status(410).json({
        success: false,
        error: "This delivery update link has expired. Please ask admin to regenerate a new link.",
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,

        deliveryInfo: order.deliveryInfo,

        orderItems: order.orderItems,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,

        productSubtotal: order.productSubtotal,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal,
        totalPrice: order.totalPrice,

        orderStatus: order.orderStatus,
        status: order.status,

        deliveryPartner: order.deliveryPartner,
        estimatedDelivery: order.estimatedDelivery,

        deliveryUpdateTokenCreatedAt: order.deliveryUpdateTokenCreatedAt,
        deliveryUpdateTokenExpiresAt: order.deliveryUpdateTokenExpiresAt,

        cashCollected: order.cashCollected,
        cashCollectedAmount: order.cashCollectedAmount,
        cashCollectedAt: order.cashCollectedAt,

        deliveryFailureReason: order.deliveryFailureReason,
        deliveryLastUpdatedAt: order.deliveryLastUpdatedAt,
        deliveryUpdateHistory: order.deliveryUpdateHistory || [],

        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Delivery update fetch error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.patch("/api/delivery-update/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "").trim();

    const {
      orderStatus,
      status,
      note,
      cashCollected,
      cashCollectedAmount,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Delivery update token is required",
      });
    }

    const order = await Order.findOne({
      deliveryUpdateToken: token,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Invalid or expired delivery update link",
      });
    }

    ensureDeliveryUpdateTokenExpiry(order);

    if (isDeliveryUpdateTokenExpired(order)) {
      await order.save();

      return res.status(410).json({
        success: false,
        error: "This delivery update link has expired. Please ask admin to regenerate a new link.",
      });
    }

    if (["Cancelled", "Completed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: `This order is already ${order.orderStatus}`,
      });
    }

    const requestedStatus = orderStatus || status;

    if (!requestedStatus) {
      return res.status(400).json({
        success: false,
        error: "Delivery status is required",
      });
    }

    const finalOrderStatus = normalizeOrderStatus(requestedStatus);

    if (!finalOrderStatus || !DELIVERY_LINK_STATUSES.includes(finalOrderStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid delivery status",
        allowedStatuses: DELIVERY_LINK_STATUSES,
      });
    }

    const oldOrderStatus = order.orderStatus || order.status || "Processing";

    order.orderStatus = finalOrderStatus;
    order.status = finalOrderStatus;
    order.deliveryLastUpdatedAt = new Date();

    if (finalOrderStatus !== "Failed Delivery") {
      order.trackingSteps = makeTrackingSteps(finalOrderStatus);
      order.deliveryFailureReason = "";
    }

    if (finalOrderStatus === "Failed Delivery") {
      order.deliveryFailureReason =
        String(note || "").trim() || "Delivery failed";
    }

    const cashWasCollected =
      cashCollected === true ||
      cashCollected === "true" ||
      cashCollected === 1 ||
      cashCollected === "1";

    if (cashWasCollected) {
      order.cashCollected = true;
      order.cashCollectedAmount =
        Number(cashCollectedAmount || 0) ||
        Number(order.grandTotal || order.totalPrice || 0);
      order.cashCollectedAt = new Date();

      /*
        Do not automatically mark paymentStatus as Paid here.
        Admin should verify collected cash and then mark payment as Paid.
        This keeps COD invoice logic safe.
      */
    }

    if (!Array.isArray(order.deliveryUpdateHistory)) {
      order.deliveryUpdateHistory = [];
    }

    order.deliveryUpdateHistory.push({
      status: finalOrderStatus,
      note: String(note || "").trim(),
      updatedBy:
        order.deliveryPartner?.name ||
        order.deliveryPartner?.company ||
        "Delivery Partner",
      cashCollected: cashWasCollected,
      cashCollectedAmount: cashWasCollected
        ? Number(order.cashCollectedAmount || 0)
        : 0,
      createdAt: new Date(),
    });

    const updatedOrder = await order.save();

    const becameDelivered =
      oldOrderStatus !== "Delivered" &&
      updatedOrder.orderStatus === "Delivered";

    if (becameDelivered) {
      for (const item of updatedOrder.orderItems || []) {
        if (!item.productId) continue;

        await Notification.create({
          userEmail: updatedOrder.email,
          orderId: updatedOrder._id,
          productId: item.productId,
          title: "Delivery Completed",
          message:
            "Your order has been delivered successfully. You can now review your product.",
          type: "review",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      order: updatedOrder,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Delivery update error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE ORDER
app.delete("/api/orders/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER ROUTES
app.get("/api/users", async (req, res) => {
  try {
    res.status(200).json(await User.find({}));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users/ping", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

    res.status(200).send("User status updated");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONTACT MESSAGE ROUTES
app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    const cleanFirstName = String(firstName || "").trim();
    const cleanLastName = String(lastName || "").trim();
    const cleanEmail = String(email || "").toLowerCase().trim();
    const cleanMessage = String(message || "").trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const isFeedbackMessage =
      cleanLastName.toLowerCase() === "feedback" &&
      /RATING:/i.test(cleanMessage);

    if (isFeedbackMessage) {
      const existingFeedback = await Message.findOne({
        email: cleanEmail,
        lastName: {
          $regex: "^Feedback$",
          $options: "i",
        },
        message: {
          $regex: "RATING:",
          $options: "i",
        },
      });

      if (existingFeedback) {
        return res.status(409).json({
          success: false,
          error: "You have already submitted feedback.",
        });
      }
    }

    const newMessage = await new Message({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      message: cleanMessage,
      isRead: false,
    }).save();

    res.status(201).json({
      success: true,
      message: isFeedbackMessage
        ? "Feedback sent successfully"
        : "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
app.get("/api/feedback-stats", async (req, res) => {
  try {
    const ratingMap = {
      Terrible: {
        score: 1,
        emoji: "😡",
      },
      Poor: {
        score: 2,
        emoji: "😕",
      },
      Average: {
        score: 3,
        emoji: "😐",
      },
      Good: {
        score: 4,
        emoji: "😊",
      },
      Excellent: {
        score: 5,
        emoji: "🤩",
      },
    };

    const messages = await Message.find({
      lastName: "Feedback",
      message: {
        $regex: "RATING:",
        $options: "i",
      },
    });

    const ratings = messages
      .map((item) => {
        const text = String(item.message || "");

        const match = text.match(/RATING:\s*([A-Za-z]+)/i);

        if (!match || !match[1]) {
          return null;
        }

        const ratingLabel = match[1].trim();

        if (!ratingMap[ratingLabel]) {
          return null;
        }

        return {
          label: ratingLabel,
          score: ratingMap[ratingLabel].score,
          emoji: ratingMap[ratingLabel].emoji,
        };
      })
      .filter(Boolean);

    if (ratings.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        averageRatingText: "0.0",
        totalFeedback: 0,
        emoji: "😊",
        label: "No feedback yet",
      });
    }

    const totalScore = ratings.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    const averageRating = totalScore / ratings.length;

    let finalLabel = "Average";
    let finalEmoji = "😐";

    if (averageRating >= 4.5) {
      finalLabel = "Excellent";
      finalEmoji = "🤩";
    } else if (averageRating >= 3.5) {
      finalLabel = "Good";
      finalEmoji = "😊";
    } else if (averageRating >= 2.5) {
      finalLabel = "Average";
      finalEmoji = "😐";
    } else if (averageRating >= 1.5) {
      finalLabel = "Poor";
      finalEmoji = "😕";
    } else {
      finalLabel = "Terrible";
      finalEmoji = "😡";
    }

    res.status(200).json({
      success: true,
      averageRating,
      averageRatingText: averageRating.toFixed(1),
      totalFeedback: ratings.length,
      emoji: finalEmoji,
      label: finalLabel,
    });
  } catch (error) {
    console.error("Feedback stats error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.get("/api/admin/messages", async (req, res) => {
  try {
    res.status(200).json(await Message.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/admin/messages/:id/read", async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: req.body.isRead },
      { returnDocument: "after" }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/admin/messages/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

const getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      processingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      outOfStockProducts,
      totalUsers,
      unreadMessages,
      recentOrders,
      paidOrderDocs,
      todayPaidOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({ paymentStatus: "Paid" }),

      Order.countDocuments({ paymentStatus: "Pending" }),

      Order.countDocuments({ paymentStatus: "Failed" }),

      Order.countDocuments({
        $or: [{ orderStatus: "Processing" }, { status: "Processing" }],
      }),

      Order.countDocuments({
        $or: [{ orderStatus: "Confirmed" }, { status: "Confirmed" }],
      }),

      Order.countDocuments({
        $or: [{ orderStatus: "Completed" }, { status: "Completed" }],
      }),

      Order.countDocuments({
        $or: [{ orderStatus: "Cancelled" }, { status: "Cancelled" }],
      }),

      Product.countDocuments(),

      Product.countDocuments({ stockStatus: "Out of Stock" }),

      User.countDocuments(),

      Message.countDocuments({ isRead: false }),

      Order.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select(
          "customerName email paymentMethod paymentStatus orderStatus status totalPrice grandTotal createdAt orderItems"
        ),

      Order.find({ paymentStatus: "Paid" }).select(
        "totalPrice grandTotal orderItems createdAt"
      ),

      Order.find({
        paymentStatus: "Paid",
        createdAt: { $gte: startOfToday },
      }).select("totalPrice grandTotal orderItems createdAt"),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
          },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $group: {
            _id: {
              productId: "$orderItems.productId",
              title: "$orderItems.title",
            },
            title: { $first: "$orderItems.title" },
            image: { $first: "$orderItems.image" },
            quantitySold: { $sum: "$orderItems.qty" },
            revenue: { $sum: "$orderItems.subtotal" },
          },
        },
        {
          $sort: {
            quantitySold: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
    ]);

    const totalRevenue = paidOrderDocs.reduce((total, order) => {
      return total + Number(order.grandTotal || order.totalPrice || 0);
    }, 0);

    const todayRevenue = todayPaidOrders.reduce((total, order) => {
      return total + Number(order.grandTotal || order.totalPrice || 0);
    }, 0);

    const totalItemsSold = paidOrderDocs.reduce((total, order) => {
      const orderQty =
        order.orderItems?.reduce((sum, item) => {
          return sum + Number(item.qty || 0);
        }, 0) || 0;

      return total + orderQty;
    }, 0);

    const todayItemsSold = todayPaidOrders.reduce((total, order) => {
      const orderQty =
        order.orderItems?.reduce((sum, item) => {
          return sum + Number(item.qty || 0);
        }, 0) || 0;

      return total + orderQty;
    }, 0);

    const stats = {
      totalOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      processingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      outOfStockProducts,
      totalUsers,
      unreadMessages,
      totalRevenue,
      revenue: totalRevenue,
      todayRevenue,
      totalItemsSold,
      todayItemsSold,
      todayOrders: todayPaidOrders.length,

      // extra compatibility
      pendingOrders: processingOrders + confirmedOrders,
      lowStockProducts: outOfStockProducts,
      totalMessages: unreadMessages,
    };

    res.status(200).json({
      success: true,
      stats,
      recentOrders,
      topProducts,

      // old frontend compatibility
      totalOrders,
      totalProducts,
      totalUsers,
      totalMessages: unreadMessages,
      totalRevenue,
      revenue: totalRevenue,
      pendingOrders: processingOrders + confirmedOrders,
      lowStockProducts: outOfStockProducts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADMIN DASHBOARD ROUTES
app.get("/api/admin/dashboard-stats", getDashboardStats);
app.get("/api/admin/dashboard", getDashboardStats);

// REPORT ROUTES
app.get("/api/admin/daily-report", async (req, res) => {
  try {
    const { timeframe = "daily" } = req.query;

    const startDate = new Date();

    if (timeframe === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    });

    let revenue = 0;
    let itemsSold = 0;

    orders.forEach((order) => {
      revenue += Number(
        order.grandTotal ||
        order.totalPrice ||
        0
      );

      itemsSold += order.orderItems.reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0
      );
    });

    const itemsAdded = await Product.countDocuments({
      createdAt: { $gte: startDate },
    });
    
    const breakdown = [];
    
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const existing = breakdown.find(
          (p) => p.name === item.title
        );
    
        if (existing) {
          existing.unitsSold += Number(item.qty || 0);
          existing.revenue += Number(item.subtotal || 0);
        } else {
          breakdown.push({
            name: item.title,
            price: Number(item.price || 0),
            unitsSold: Number(item.qty || 0),
            revenue: Number(item.subtotal || 0),
          });
        }
      });
    });
    
    res.status(200).json({
      success: true,
      metrics: {
        revenue,
        itemsSold,
        itemsAdded,
        breakdown,
      },
    });
    
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// START SERVER AFTER DATABASE CONNECTION
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB Atlas! âœ…");

   await seedAdminAccount();
await seedPolicies();
await seedInvoiceSettings();

    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: ${PORT}`);
});
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();