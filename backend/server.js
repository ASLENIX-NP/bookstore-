const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. IMPORT MODELS
// FIXED: Changed to 'Product' with a capital P to perfectly match your filesystem disk filename case
const Product = require('./models/Product');
const AdminModel = require('./models/Admin'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 3. DATABASE SEEDER ROUTINE
const seedAdminAccount = async () => {
  try {
    const adminExists = await AdminModel.findOne({ email: 'admin@bookstore.com' });
    
    if (!adminExists) {
      const defaultAdmin = new AdminModel({
        email: 'admin@bookstore.com',
        password: 'password123'
      });
      
      await defaultAdmin.save();
      console.log('Admin account credentials seeded successfully into MongoDB! 🔑');
    }
  } catch (err) {
    console.error('Error executing admin cloud data seed routine:', err);
  }
};

// 4. CONNECT TO MONGOOSE DATA CLUSTERS
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas Cloud! ✅');
    seedAdminAccount();
  })
  .catch((err) => console.error('MongoDB connection error ❌:', err));

// 5. API ROUTE PATHWAYS

// Root Health Check
app.get('/', (req, res) => {
  res.send('BookStore Backend Server API is running smoothly!');
});

// Admin Login Route
app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password credentials" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid email or password credentials" });
    }

    res.status(200).json({
      message: "Login verified successfully",
      admin: { id: admin._id, email: admin.email }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Auth Gateway Server processing fault", error: error.message });
  }
});

// Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await Product.find({}); 
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); 
  } catch (error) {
    // FIXED: Returns the exact message string generated from your Mongoose model validators
    res.status(400).json({ message: error.message });
  }
});

// Update product stock availability status flags
app.patch('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stockStatus: req.body.stockStatus },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product entry complete removal
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product systematically purged from database records cluster" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. PROCESS EXECUTION BINDING
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});