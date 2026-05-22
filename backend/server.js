const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
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

// ORDER SCHEMA & MODEL
const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    customerName: { type: String, default: "Guest Customer" },
    phone: { type: String, default: "" },

    deliveryInfo: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      region: { type: String, default: "" },
      city: { type: String, default: "" },
      building: { type: String, default: "" },
      area: { type: String, default: "" },
      address: { type: String, default: "" },
      label: { type: String, default: "Home" },
    },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        title: { type: String, required: true },
        image: { type: String, default: "" },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        subtotal: { type: Number, default: 0 },
      },
    ],

    productSubtotal: { type: Number, required: true, default: 0 },
    deliveryCharge: { type: Number, required: true, default: 100 },

    taxableAmount: { type: Number, default: 0 },
    vatRate: { type: Number, default: 13 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    totalPrice: { type: Number, required: true, default: 0 },

    checkoutType: {
      type: String,
      default: "Cart",
      enum: ["Cart", "Buy Now"],
    },

    paymentMethod: { type: String, default: "Cash on Delivery" },
    paymentMethodId: { type: String, default: "cod" },
    paymentGateway: { type: String, default: "cod" },

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

    status: { type: String, required: true, default: "Processing" },

    transactionId: { type: String, default: "" },
    paymentProof: { type: String, default: "" },
    paidAt: { type: Date, default: null },

    khaltiPidx: { type: String, default: "" },
    khaltiPaymentUrl: { type: String, default: "" },
    khaltiStatus: { type: String, default: "" },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

const khaltiRequest = async (endpoint, payload) => {
  if (!process.env.KHALTI_SECRET_KEY) {
    throw new Error("KHALTI_SECRET_KEY is missing in backend .env file");
  }

  const response = await fetch(`${KHALTI_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail || data?.error_key || "Khalti API error"
    );
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
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
      console.log("Admin account created in your MongoDB ✅");
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

// PRODUCT ROUTES
app.get("/api/products", async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = featured === "true" ? { isFeatured: true } : {};
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    res.status(201).json(await new Product(req.body).save());
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    if (!product) return res.status(404).json({ error: "Product not found" });

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
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/products/:id", async (req, res) => {
  try {
    const { stockStatus } = req.body;

    if (!stockStatus) {
      return res.status(400).json({ error: "stockStatus is required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stockStatus, statusFlag: stockStatus },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ORDER ROUTES
app.post("/api/orders", async (req, res) => {
  try {
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
      return res.status(400).json({
        error: "Customer name, email, and phone are required",
      });
    }

    if (!deliveryInfo) {
      return res.status(400).json({ error: "Delivery information is required" });
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one product",
      });
    }

    const cleanedItems = orderItems.map((item) => {
      const qty = Number(item.qty || item.quantity || 1);
      const price = Number(item.price || 0);

      return {
        productId: item.productId || item._id || undefined,
        title: item.title || item.name || "Product",
        image: item.image || "",
        qty,
        price,
        subtotal: roundMoney(price * qty),
      };
    });

    const calculatedProductSubtotal = roundMoney(
      cleanedItems.reduce((total, item) => total + Number(item.subtotal || 0), 0)
    );

    const finalProductSubtotal =
      Number(productSubtotal || 0) || calculatedProductSubtotal;

    const finalDeliveryCharge = Number(deliveryCharge || 100);

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

    const newOrder = await Order.create({
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
      status: orderStatus || "Processing",
      transactionId: transactionId || "",
      paymentProof: paymentProof || "",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// KHALTI: INITIATE PAYMENT
app.post("/api/payments/khalti/initiate", async (req, res) => {
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

    const amountInPaisa = toPaisa(order.totalPrice);

    if (amountInPaisa < 1000) {
      return res.status(400).json({
        error: "Khalti payment amount must be at least NPR 10",
      });
    }

    const payload = {
      return_url: `${BACKEND_URL}/api/payments/khalti/callback`,
      website_url: FRONTEND_URL,
      amount: amountInPaisa,
      purchase_order_id: String(order._id),
      purchase_order_name: `PatraPatrika Order ${String(order._id).slice(-8)}`,
      customer_info: {
        name: order.customerName || order.deliveryInfo?.fullName || "Customer",
        email: order.email || "customer@example.com",
        phone: order.phone || order.deliveryInfo?.phone || "9800000000",
      },
      amount_breakdown: [
        {
          label: "Grand Total Including VAT",
          amount: amountInPaisa,
        },
      ],
      product_details: [
        {
          identity: String(order._id),
          name: `PatraPatrika Order ${String(order._id).slice(-8)}`,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa,
        },
      ],
      merchant_extra: String(order._id),
    };

    const khaltiData = await khaltiRequest("/epayment/initiate/", payload);

    order.paymentMethod = "Khalti";
    order.paymentMethodId = "khalti";
    order.paymentGateway = "khalti";
    order.paymentStatus = "Pending";
    order.khaltiPidx = khaltiData.pidx || "";
    order.khaltiPaymentUrl = khaltiData.payment_url || "";
    order.khaltiStatus = "Initiated";
    order.transactionId = khaltiData.pidx || order.transactionId || "";
    order.gatewayResponse = khaltiData;

    await order.save();

    res.status(200).json({
      success: true,
      payment_url: khaltiData.payment_url,
      pidx: khaltiData.pidx,
      order,
    });
  } catch (error) {
    console.error("Khalti initiate error:", error.data || error.message);
    res.status(400).json({
      success: false,
      error: error.data || error.message || "Failed to initiate Khalti payment",
    });
  }
});

// KHALTI: CALLBACK + LOOKUP VERIFICATION
app.get("/api/payments/khalti/callback", async (req, res) => {
  let order = null;

  try {
    const { pidx, purchase_order_id, transaction_id } = req.query;

    if (!pidx) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=khalti&paymentStatus=failed`
      );
    }

    const lookupData = await khaltiRequest("/epayment/lookup/", { pidx });

    const lookupConditions = [{ khaltiPidx: String(pidx) }];

    if (purchase_order_id && mongoose.Types.ObjectId.isValid(purchase_order_id)) {
      lookupConditions.push({ _id: purchase_order_id });
    }

    order = await Order.findOne({ $or: lookupConditions });

    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/order-success?payment=khalti&paymentStatus=failed`
      );
    }

    const khaltiStatus = lookupData.status || req.query.status || "Unknown";
    const expectedAmount = toPaisa(order.totalPrice);
    const returnedAmount = Number(
      lookupData.total_amount || req.query.total_amount || 0
    );
    const amountMatches = returnedAmount === expectedAmount;

    order.khaltiStatus = khaltiStatus;
    order.gatewayResponse = lookupData;

    if (khaltiStatus === "Completed" && amountMatches) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      order.status = "Confirmed";
      order.transactionId =
        lookupData.transaction_id ||
        transaction_id ||
        order.transactionId ||
        String(pidx);
      order.paidAt = new Date();
    } else if (khaltiStatus === "Completed" && !amountMatches) {
      order.paymentStatus = "Verification Required";
      order.transactionId =
        lookupData.transaction_id ||
        transaction_id ||
        order.transactionId ||
        String(pidx);
    } else if (
      ["Expired", "User canceled", "Canceled", "Failed"].includes(khaltiStatus)
    ) {
      order.paymentStatus = "Failed";
      order.transactionId =
        lookupData.transaction_id ||
        transaction_id ||
        order.transactionId ||
        String(pidx);
    } else {
      order.paymentStatus = "Pending";
    }

    await order.save();

    const frontendStatus =
      order.paymentStatus === "Paid"
        ? "paid"
        : order.paymentStatus === "Failed"
        ? "failed"
        : "pending";

    return res.redirect(
      `${FRONTEND_URL}/order-success?orderId=${order._id}&payment=khalti&paymentStatus=${frontendStatus}`
    );
  } catch (error) {
    console.error("Khalti callback error:", error.data || error.message);

    if (order) {
      order.paymentStatus = "Failed";
      order.khaltiStatus = "Failed";
      order.gatewayResponse = error.data || { error: error.message };
      await order.save();
    }

    return res.redirect(
      `${FRONTEND_URL}/order-success${
        order ? `?orderId=${order._id}&` : "?"
      }payment=khalti&paymentStatus=failed`
    );
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    res.status(200).json(await Order.find({}).sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
      order.status = req.body.orderStatus;
    } else {
      const newStatus =
        order.status === "Processing" ? "Completed" : "Processing";

      order.status = newStatus;
      order.orderStatus = newStatus;
    }

    res.status(200).json(await order.save());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/orders/:id/payment", async (req, res) => {
  try {
    const { paymentStatus, transactionId, paymentProof } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;

      if (paymentStatus === "Paid" && !order.paidAt) {
        order.paidAt = new Date();
      }
    }

    if (transactionId !== undefined) order.transactionId = transactionId;
    if (paymentProof !== undefined) order.paymentProof = paymentProof;

    res.status(200).json(await order.save());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) return res.status(404).json({ error: "Order not found" });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER STATUS & FEATURES
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

    if (!userId) return res.status(400).json({ error: "userId is required" });

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
      { new: true }
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

    soldItems.forEach((p) => {
      revenue += Number(p.price || 0);
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas! ✅");
    await seedAdminAccount();
  })
  .catch((err) => console.error("Connection error:", err));

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));