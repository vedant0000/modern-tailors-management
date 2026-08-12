const Order = require("../models/Order");
const Setting = require("../models/Setting");
const crypto = require("crypto");
const { processItems } = require("../utils/orderUtils");

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      deliveryDate,
      items,
      advanceAmount,
      advancePaymentMode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one garment is required.",
      });
    }

    const settings = await Setting.findOne();

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: "Settings not found.",
      });
    }

    const nextOrderNumber =
      settings.currentOrderNumber + 1;

    const publicInvoiceId =
      crypto.randomBytes(16).toString("hex");

    const orderDate = new Date();

    const delivery = new Date(deliveryDate);

    let finalCuttingDate;

    if (req.body.cuttingDate) {
      finalCuttingDate = new Date(req.body.cuttingDate);
    } else {
      finalCuttingDate = new Date(delivery);

      finalCuttingDate.setDate(
        finalCuttingDate.getDate() - 2
      );
    }

    const {
      processedItems,
      totalAmount,
    } = processItems(items);

    const transactions = [];

    if (Number(advanceAmount) > 0) {
      transactions.push({
        amount: Number(advanceAmount),

        mode: advancePaymentMode,

        type: "Advance",

        note: "Advance Payment",
      });
    }

    const order = await Order.create({
      orderNumber: nextOrderNumber,

      publicInvoiceId,

      customerName,

      mobileNumber,

      items: processedItems,

      orderDate,

      deliveryDate: delivery,

      cuttingDate: finalCuttingDate,

      payment: {
        totalAmount,
        transactions,
      },

      status: "Pending",

      invoiceStatus: "Pending",
    });

    settings.currentOrderNumber = nextOrderNumber;

    await settings.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const startDate = req.query.startDate;

    const endDate = req.query.endDate;

    let query = {};

    if (search) {
      query.$or = [
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          orderNumber: Number(search) || -1,
        },
      ];
    }

    if (startDate && endDate) {
      query.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query)
      .sort({ orderNumber: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    const revenueResult = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$payment.totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(totalOrders / limit),

      totalOrders,

      totalRevenue,

      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPublicInvoice = async (req, res) => {
  try {
    const { publicInvoiceId } = req.params;

    if (!publicInvoiceId) {
      return res.status(400).json({
        success: false,
        message: "Public invoice ID is required.",
      });
    }

    const order = await Order.findOne({
      publicInvoiceId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    const paidAmount = order.payment.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const remainingAmount =
      order.payment.totalAmount - paidAmount;

    res.status(200).json({
      success: true,

      invoice: {
        publicInvoiceId: order.publicInvoiceId,
        orderNumber: order.orderNumber,

        customerName: order.customerName,
        mobileNumber: order.mobileNumber,

        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,

        items: order.items,

        payment: {
          totalAmount: order.payment.totalAmount,
          paidAmount,
          remainingAmount,
          transactions: order.payment.transactions,
        },

        invoiceStatus: order.invoiceStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const {
      customerName,
      mobileNumber,
      deliveryDate,
      cuttingDate,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one garment is required.",
      });
    }

    // Process all garments
    const {
      processedItems,
      totalAmount,
    } = processItems(items);

    // Delivery & Cutting Date
    let finalDeliveryDate = new Date(
      deliveryDate || order.deliveryDate
    );

    let finalCuttingDate;

    if (cuttingDate) {
      finalCuttingDate = new Date(cuttingDate);
    } else {
      finalCuttingDate = new Date(finalDeliveryDate);

      finalCuttingDate.setDate(
        finalCuttingDate.getDate() - 2
      );
    }

    // Update order details
    order.customerName =
      customerName || order.customerName;

    order.mobileNumber =
      mobileNumber || order.mobileNumber;

    order.deliveryDate = finalDeliveryDate;

    order.cuttingDate = finalCuttingDate;

    order.items = processedItems;

    // Update total amount
    order.payment.totalAmount = totalAmount;

    // Calculate payment summary
    const paidAmount =
      order.payment.transactions.reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      );

    const remainingAmount =
      totalAmount - paidAmount;

    // Update invoice status
    if (remainingAmount <= 0) {
      order.invoiceStatus = "Completed";
    } else {
      order.invoiceStatus = "Pending";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully.",

      paidAmount,

      remainingAmount,

      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTodayCuttings = async (req, res) => {
  try {
    const orders = await Order.find({
      items: {
        $elemMatch: {
          isCuttingCompleted: false,
        },
      },
    }).sort({
      cuttingDate: 1,
    });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeCutting = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Garment ID is required.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const item =
      order.items.id(itemId) ||
      order.items.find(
        (orderItem) =>
          orderItem.itemNumber === Number(itemId)
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Garment not found.",
      });
    }

    if (item.isCuttingCompleted) {
      return res.status(400).json({
        success: false,
        message: "Garment cutting is already completed.",
      });
    }

    item.isCuttingCompleted = true;
    item.status = "Stitching";

    const allCuttingCompleted = order.items.every(
      (orderItem) => orderItem.isCuttingCompleted
    );

    if (
      order.status !== "Delivered" &&
      order.status !== "Partially Delivered"
    ) {
      order.status = "In Progress";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: allCuttingCompleted
        ? "All garment cutting completed."
        : "Garment cutting completed.",
      allCuttingCompleted,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markGarmentReady = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const item =
      order.items.id(itemId) ||
      order.items.find(
        (orderItem) =>
          orderItem.itemNumber === Number(itemId)
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Garment not found.",
      });
    }

    if (item.status === "Ready") {
      return res.status(400).json({
        success: false,
        message: "Garment is already marked as ready.",
      });
    }

    if (item.status !== "Stitching") {
      return res.status(400).json({
        success: false,
        message:
          "Only garments in Stitching can be marked as Ready.",
      });
    }

    item.status = "Ready";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Garment marked as ready.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTodayDeliveries = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const orders = await Order.find({
      deliveryDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },

      items: {
        $elemMatch: {
          status: {
            $ne: "Delivered",
          },
        },
      },
    }).sort({
      deliveryDate: 1,
    });

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { amount, mode, note = "" } = req.body;

    const paymentAmount = Number(amount);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const paidAmount = order.payment.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const remainingAmount =
      order.payment.totalAmount - paidAmount;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0.",
      });
    }

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds remaining balance.",
      });
    }

    if (!["Cash", "Online"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode.",
      });
    }

    let transactionType;

    if (order.payment.transactions.length === 0) {
      transactionType = "Advance";
    } else if (paymentAmount === remainingAmount) {
      transactionType = "Final";
    } else {
      transactionType = "Partial";
    }

    order.payment.transactions.push({
      amount: paymentAmount,
      mode,
      type: transactionType,
      note,

      // TODO: Replace with logged-in user's name after JWT authentication.
      receivedBy: "Admin",
    });

    const newPaidAmount = order.payment.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const newRemaining =
      order.payment.totalAmount - newPaidAmount;

    if (newRemaining === 0) {
      order.invoiceStatus = "Completed";
    } else {
      order.invoiceStatus = "Pending";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment added successfully.",
      paidAmount: newPaidAmount,
      remainingAmount: newRemaining,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deliverItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const item =
      order.items.id(itemId) ||
      order.items.find(
        (orderItem) =>
          orderItem.itemNumber === Number(itemId)
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Garment not found.",
      });
    }

    // Prevent delivering the same garment twice
    if (item.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Garment is already delivered.",
      });
    }

    // Only ready garments can be delivered
    if (item.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message:
          "Only garments marked as 'Ready' can be delivered.",
      });
    }

    // Mark garment as delivered
    item.status = "Delivered";

    // Check overall order status
    const allDelivered = order.items.every(
      (orderItem) => orderItem.status === "Delivered"
    );

    if (allDelivered) {
      order.status = "Delivered";
    } else {
      order.status = "Partially Delivered";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Garment delivered successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getPublicInvoice,
  getOrderById,
  updateOrder,
  getTodayCuttings,
  completeCutting,
  markGarmentReady,
  getTodayDeliveries,
  addPayment,
  deliverItem,
};