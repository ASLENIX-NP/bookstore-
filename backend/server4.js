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

// USER ORDER ROUTE ALIAS
// Keep this because some frontend pages use /api/orders/user/:email
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

// ADMIN FEATURES: USERS
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

    console.log("Connected to MongoDB Atlas! ✅");

    await seedAdminAccount();
    await seedPolicies();

    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();