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