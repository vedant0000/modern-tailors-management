const Order = require("../models/Order");
const Setting = require("../models/Setting");
const crypto = require("crypto");

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

    let totalAmount = 0;

    const processedItems = items.map(
      (item, index) => {
        const subtotal =
          item.quantity * item.unitPrice;

        totalAmount += subtotal;

        return {
          itemNumber: index + 1,

          garmentType: item.garmentType,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          subtotal,

          measurements:
            item.measurements || [],

          fabricImageUrl:
            item.fabricImageUrl || "",

          note: item.note || "",

          isUrgent:
            item.isUrgent || false,
        };
      }
    );

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

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If delivery date is changed but cutting date is not provided,
    // automatically set cutting date to delivery date - 2 days
    if (req.body.deliveryDate && !req.body.cuttingDate) {
      const delivery = new Date(req.body.deliveryDate);

      const cuttingDate = new Date(delivery);

      cuttingDate.setDate(
        cuttingDate.getDate() - 2
      );

      req.body.cuttingDate = cuttingDate;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      order: updatedOrder,
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
      59
    );

    const orders = await Order.find({
      cuttingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isCuttingCompleted: false,
    }).sort({ orderNumber: 1 });

    res.status(200).json({
      success: true,
      totalCuttings: orders.length,
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
        message: "Garment ID is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
        message: "Garment not found",
      });
    }

    item.isCuttingCompleted = true;

    item.status = "Stitching";

    const hasCutItems = order.items.some(
      (orderItem) => orderItem.isCuttingCompleted
    );

    if (
      hasCutItems &&
      order.status !== "Delivered" &&
      order.status !== "Partially Delivered"
    ) {
      order.status = "In Progress";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Garment cutting completed.",
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
      59
    );

    const orders = await Order.find({
      deliveryDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $ne: "Delivered",
      },
    }).sort({ orderNumber: 1 });

    res.status(200).json({
      success: true,
      totalDeliveries: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completePayment = async (req, res) => {
  try {
    const { paymentMode } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.payment.remaining.mode = paymentMode;

    order.payment.remaining.amount = 0;

    order.status = "Delivered";

    order.invoiceStatus = "Completed";

    await order.save();

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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  getTodayCuttings,
  completeCutting,
  getTodayDeliveries,
  completePayment,
};
