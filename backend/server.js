const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// IMPORT MODELS
const Product = require("./models/product");
const AdminModel = require("./models/Admin");

// CREATE INLINE ORDER SCHEMA & MODEL TO AVOID ROUTE CRASHES
const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "Guest Customer"
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
      default: 0,
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

// Prevent mongoose overwrite error if compiling multiple times
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE (UPDATED TO ACCEPT LARGE BASE64 STRINGS)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// ADMIN SEEDER
const seedAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Admin email or password missing in .env");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminExists = await AdminModel.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultAdmin = new AdminModel({
        email: adminEmail,
        password: hashedPassword,
      });

      await defaultAdmin.save();
      console.log("Admin account seeded successfully into MongoDB! 🔑");
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      adminPassword,
      adminExists.password
    );

    if (!isPasswordCorrect) {
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log("Admin password updated from .env successfully! 🔑");
    }
  } catch (err) {
    console.error("Error executing admin cloud data seed routine:", err);
  }
};

// CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas Cloud! ✅");
    seedAdminAccount();
  })
  .catch((err) => console.error("MongoDB connection error ❌:", err));

// ROOT HEALTH CHECK
app.get("/", (req, res) => {
  res.send("BookStore Backend Server API is running smoothly!");
});


/**
 * @route   GET /api/admin/daily-report
 * @desc    Calculates live business analytics for all store items (Daily vs Weekly vs Monthly)
 * @access  Admin Private
 */
app.get('/api/admin/daily-report', async (req, res) => {
  try {
    const { timeframe } = req.query; // Expects 'daily', 'weekly', or 'monthly'

    // 1. Establish precise starting time boundaries dynamically
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (timeframe) {
      case 'monthly':
        startDate.setDate(1); // Roll back to the first day of the current month
        break;
      case 'weekly':
        // Roll back to the beginning of the current week (Sunday)
        const currentDayIndex = startDate.getDay();
        startDate.setDate(startDate.getDate() - currentDayIndex);
        break;
      case 'daily':
      default:
        // Already set to midnight today
        break;
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // 2. Query total products added during the chosen timeline
    const itemsAdded = await Product.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // 3. Compute structural sales performance metrics across ALL items
    const soldItems = await Product.find({ 
      stockStatus: 'Out of Stock',
      updatedAt: { $gte: startDate, $lte: endDate }
    });

    let computedRevenue = 0;
    let itemsSoldCounter = 0;
    const itemizedBreakdownMap = {};

    // Map live database collections to avoid static simulated arrays
    soldItems.forEach(product => {
      const itemPrice = product.price || 0;
      const quantityDispatched = 1;

      computedRevenue += itemPrice * quantityDispatched;
      itemsSoldCounter += quantityDispatched;

      const itemTitle = product.title || 'Unknown Product Item';

      if (itemizedBreakdownMap[itemTitle]) {
        itemizedBreakdownMap[itemTitle].unitsSold += quantityDispatched;
        itemizedBreakdownMap[itemTitle].revenue += itemPrice * quantityDispatched;
      } else {
        itemizedBreakdownMap[itemTitle] = {
          name: itemTitle,
          price: itemPrice,
          unitsSold: quantityDispatched,
          revenue: itemPrice * quantityDispatched
        };
      }
    });

    const breakdownArray = Object.values(itemizedBreakdownMap);

    // 4. Return unified metrics payload
    res.status(200).json({
      success: true,
      timeframe: timeframe || 'daily',
      metrics: {
        revenue: computedRevenue,
        itemsSold: itemsSoldCounter,
        itemsAdded: itemsAdded,
        breakdown: breakdownArray
      }
    });

  } catch (error) {
    console.error("Dashboard Reporting API Failure:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to extract active store data analytics reports logic loop.", 
      error: error.message 
    });
  }
});


// OLD ADMIN LOGIN ROUTE KEPT FOR YOUR EXISTING FRONTEND
app.post("/api/auth/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await AdminModel.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password credentials",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login verified successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Auth Gateway Server processing fault",
      error: error.message,
    });
  }
});

// FETCH ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// ADD NEW PRODUCT
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// UPDATE PRODUCT STOCK STATUS
app.patch("/api/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stockStatus: req.body.stockStatus },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product systematically purged from database records cluster",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// ==========================================
// ORDER REGISTRY MANAGEMENT ENDPOINTS
// ==========================================

/**
 * @route   GET /api/orders
 * @desc    Fetch all transaction logs back to the React Admin Table
 */
app.get("/api/orders", async (req, res) => {
  try {
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch store database transaction history registers.",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Creates an order transaction log record entry
 */
app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({
      message: "Failed to process order invoice logic stack.",
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Toggles an order's status between Processing and Completed
 */
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Toggle logic
    order.status = order.status === "Processing" ? "Completed" : "Processing";
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({
      message: "Failed to modify status attribute.",
      error: error.message,
    });
  }
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});