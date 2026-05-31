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
const Product = require("./models/Product");
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

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.status(200).json(product);
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
        products.map((product) => [String(product._id), product])
      );

      for (const productId of productIds) {
        const product = productMap.get(productId);
        const requiredQty = Number(quantityMap.get(productId) || 0);

        if (!product) {
          const error = new Error("One or more scanned products were not found");
          error.statusCode = 404;
          throw error;
        }

        const availableStock = Number(product.stock || 0);

        if (availableStock <= 0) {
          const error = new Error(`"${product.name}" is out of stock`);
          error.statusCode = 400;
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
        const price = Number(product.salePrice || product.price || 0);

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

        const price = Number(product.salePrice || product.price || 0);

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

    const barcode = crypto.randomBytes(6).toString("hex");

    const sku = uuidv4().slice(0, 8).toUpperCase();
    
    const stockValue = Number(req.body.stock || 0);
    
    const product = new Product({
      ...req.body,
    
      image: imageUrl,
    
      barcode,
    
      sku,
    
      stock: stockValue,
    
      sold: 0,
    
      stockStatus:
        stockValue <= 0 ? "Out of Stock" : "In Stock",
    
      statusFlag:
        stockValue <= 0 ? "Out of Stock" : "In Stock",
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({
        error: "Name, rating, and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (numericRating < 1 || numericRating > 5) {
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

    product.reviews.push({
      name,
      email,
      rating: numericRating,
      comment,
    });

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce(
        (total, item) => total + Number(item.rating || 0),
        0
      ) / product.reviews.length;

    const updatedProduct = await product.save();

    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(400).json({
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

            trackingSteps: [
              {
                title: "Order Placed",
                completed: true,
                date: new Date(),
              },

              {
                title: "Order Confirmed",
                completed: false,
              },

              {
                title: "Packaging",
                completed: false,
              },

              {
                title: "Shipped",
                completed: false,
              },

              {
                title: "Delivered",
                completed: false,
              },
            ],

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
    const { orderStatus, status, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const updateData = {};

    const finalOrderStatus = orderStatus || status;

    if (finalOrderStatus) {
      updateData.orderStatus = finalOrderStatus;
      updateData.status = finalOrderStatus;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;

      if (paymentStatus === "Paid") {
        updateData.paidAt = new Date();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No status value provided",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after",
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,

      // compatibility
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
app.patch("/api/orders/:id/payment", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID",
      });
    }

    const { paymentStatus, transactionId, paymentProof } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;

      if (paymentStatus === "Paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    if (transactionId !== undefined) {
      order.transactionId = transactionId;
    }

    if (paymentProof !== undefined) {
      order.paymentProof = paymentProof;
    }

    res.status(200).json(await order.save());
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const newMessage = await new Message({
      firstName,
      lastName,
      email,
      message,
      isRead: false,
    }).save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
    const { timeframe } = req.query;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeframe === "monthly") {
      startDate.setDate(1);
    } else if (timeframe === "weekly") {
      startDate.setDate(startDate.getDate() - startDate.getDay());
    }

    const soldItems = await Product.find({
      stockStatus: "Out of Stock",
      updatedAt: { $gte: startDate },
    });

    let revenue = 0;

    soldItems.forEach((product) => {
      revenue += Number(product.price || 0);
    });

    res.status(200).json({
      metrics: {
        revenue,
        itemsSold: soldItems.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
