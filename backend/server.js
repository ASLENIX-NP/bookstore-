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
    orderItems: [{ title: { type: String, required: true }, qty: { type: Number, required: true, default: 1 }, price: { type: Number, required: true } }],
    totalPrice: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "Processing" },
  },
  { timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// AUTH ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// --- PRODUCT ROUTES ---
app.get("/api/products", async (req, res) => {
  try { res.status(200).json(await Product.find({})); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/products", async (req, res) => {
  try { res.status(201).json(await new Product(req.body).save()); } 
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.patch("/api/products/:id", async (req, res) => {
  try { res.status(200).json(await Product.findByIdAndUpdate(req.params.id, { stockStatus: req.body.stockStatus }, { new: true })); }
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete("/api/products/:id", async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Deleted" }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ORDER ROUTES ---
app.get("/api/orders", async (req, res) => {
  try { res.status(200).json(await Order.find({}).sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    order.status = order.status === "Processing" ? "Completed" : "Processing";
    res.status(200).json(await order.save());
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// --- ADMIN FEATURES (USERS, MESSAGES, REPORTS) ---
app.get("/api/users", async (req, res) => {
  try { res.status(200).json(await User.find({})); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/contact', async (req, res) => {
  try { await new Message(req.body).save(); res.status(201).json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/messages', async (req, res) => {
  try { res.status(200).json(await Message.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/daily-report', async (req, res) => {
  try {
    const { timeframe } = req.query;
    const startDate = new Date(); startDate.setHours(0, 0, 0, 0);
    if (timeframe === 'monthly') startDate.setDate(1);
    else if (timeframe === 'weekly') startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const soldItems = await Product.find({ stockStatus: 'Out of Stock', updatedAt: { $gte: startDate } });
    let revenue = 0;
    soldItems.forEach(p => revenue += p.price);
    res.status(200).json({ metrics: { revenue, itemsSold: soldItems.length } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// INITIALIZE
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Connected to MongoDB Atlas! ✅"); })
  .catch((err) => console.error("Connection error:", err));

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));