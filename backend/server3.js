// GET ALL ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
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
    const email = String(req.params.email || "").toLowerCase().trim();

    const orders = await Order.find({
      email,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET SINGLE ORDER
app.get("/api/orders/:id", async (req, res) => {
  try {
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
    });
  } catch (error) {
    console.error("Fetch single order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { orderStatus, status, paymentStatus } = req.body;

    const updateData = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      updateData.status = orderStatus;
    }

    if (status) {
      updateData.status = status;
      updateData.orderStatus = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;

      if (paymentStatus === "Paid") {
        updateData.paidAt = new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    });

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
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// CANCEL ORDER
app.patch("/api/orders/:id/cancel", async (req, res) => {
  try {
    const { cancelledBy = "customer", cancelReason = "" } = req.body;

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
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE ORDER
app.delete("/api/orders/:id", async (req, res) => {
  try {
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