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

// PRODUCT ROUTES
app.get("/api/products", async (req, res) => {
  try {
    const query = {};

    if (req.query.featured === "true") {
      query.featured = true;
    }

    if (req.query.flashSale === "true") {
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

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
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

    const product = new Product({
      ...req.body,
      image: imageUrl,
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
  try {
    const {
      email,
      customerName,
      phone,
      deliveryInfo,
      orderItems,
      productSubtotal,
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
        success: false,
        error: "Customer name, email, and phone are required",
      });
    }

    if (!deliveryInfo) {
      return res.status(400).json({
        success: false,
        error: "Delivery information is required",
      });
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must contain at least one product",
      });
    }

    const customerLat = Number(deliveryInfo?.lat);
    const customerLng = Number(deliveryInfo?.lng);

    if (!Number.isFinite(customerLat) || !Number.isFinite(customerLng)) {
      return res.status(400).json({
        success: false,
        error:
          "Customer location is required for delivery calculation. Please use current location on delivery page.",
      });
    }

    const deliveryData = calculateDelivery({
      lat: customerLat,
      lng: customerLng,
    });

    const finalDeliveryCharge = Number(deliveryData.charge || 0);

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

    const finalTaxableAmount =
      Number(taxableAmount || 0) ||
      roundMoney(finalProductSubtotal + finalDeliveryCharge);

    const finalVatRate = Number(vatRate ?? 13);

    const finalVatAmount =
      Number(vatAmount || 0) ||
      roundMoney((finalTaxableAmount * finalVatRate) / 100);

    const finalGrandTotal =
      Number(grandTotal || totalPrice || 0) ||
      roundMoney(finalProductSubtotal + finalDeliveryCharge);

    const selectedPaymentMethod = paymentMethod || "Cash on Delivery";
    const selectedPaymentMethodId = paymentMethodId || "cod";

    const newOrder = await Order.create({
      email: String(email).toLowerCase().trim(),

      customerName,

      phone,

      deliveryInfo: {
        ...deliveryInfo,
        lat: customerLat,
        lng: customerLng,
      },

      orderItems: cleanedItems,

      productSubtotal: finalProductSubtotal,

      deliveryCharge: finalDeliveryCharge,

      deliveryDistanceKm: deliveryData.distanceKm,

      estimatedDelivery: deliveryData.days,

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

      status: "pending",

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

      transactionId: transactionId || "",

      paymentProof: paymentProof || "",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});