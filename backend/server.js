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
const User = require("./models/User");
const Message = require("./models/Message");

// ORDER SCHEMA & MODEL
const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    customerName: { type: String, default: "Guest Customer" },
    orderItems: [
      {
        title: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "Processing" },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const app = express();
const PORT = process.env.PORT || 5000;

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
      console.log("Admin account created in your MongoDB ✅");
      return;
    }

    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(adminPassword, existingAdmin.password);
    } catch { passwordMatches = false; }

    if (!passwordMatches) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log("Admin password updated in your MongoDB ✅");
      return;
    }

    console.log("Admin account already exists ✅");
  } catch (error) {
    console.error("Admin seed error:", error.message);
  }
};

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// AUTH ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// --- PRODUCT ROUTES (UPDATED FOR FEATURED FILTER) ---
app.get("/api/products", async (req, res) => {
  try {
    const { featured } = req.query;
    // Check if featured=true is requested, otherwise return all
    const filter = featured === 'true' ? { isFeatured: true } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post("/api/products", async (req, res) => {
  try { res.status(201).json(await new Product(req.body).save()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.post("/api/products/:id/reviews", async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    if (!name || !rating || !comment) return res.status(400).json({ error: "Name, rating, and comment are required" });
    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.reviews.push({ name, email, rating: numericRating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((total, item) => total + Number(item.rating || 0), 0) / product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).json(updatedProduct);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.patch("/api/products/:id", async (req, res) => {
  try {
    const { stockStatus } = req.body;
    if (!stockStatus) return res.status(400).json({ error: "stockStatus is required" });
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { stockStatus, statusFlag: stockStatus }, { new: true });
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(updatedProduct);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ORDER ROUTES ---
app.get("/api/orders", async (req, res) => {
  try { res.status(200).json(await Order.find({}).sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = order.status === "Processing" ? "Completed" : "Processing";
    res.status(200).json(await order.save());
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// --- USER STATUS & FEATURES ---
app.get("/api/users", async (req, res) => {
  try { res.status(200).json(await User.find({})); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/users/ping", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    res.status(200).send("User status updated");
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CONTACT MESSAGE ROUTES ---
app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) return res.status(400).json({ success: false, error: "All fields are required" });
    const newMessage = await new Message({ firstName, lastName, email, message, isRead: false }).save();
    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/api/admin/messages", async (req, res) => {
  try { res.status(200).json(await Message.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/messages/:id/read", async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead }, { new: true });
    if (!updatedMessage) return res.status(404).json({ success: false, message: "Message not found" });
    res.status(200).json({ success: true, message: updatedMessage });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete("/api/admin/messages/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).json({ success: false, message: "Message not found" });
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- REPORT ROUTES ---
app.get("/api/admin/daily-report", async (req, res) => {
  try {
    const { timeframe } = req.query;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    if (timeframe === "monthly") startDate.setDate(1);
    else if (timeframe === "weekly") startDate.setDate(startDate.getDate() - startDate.getDay());
    const soldItems = await Product.find({ stockStatus: "Out of Stock", updatedAt: { $gte: startDate } });
    let revenue = 0;
    soldItems.forEach((p) => { revenue += Number(p.price || 0); });
    res.status(200).json({ metrics: { revenue, itemsSold: soldItems.length } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas! ✅");
    await seedAdminAccount();
  })
  .catch((err) => console.error("Connection error:", err));

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));