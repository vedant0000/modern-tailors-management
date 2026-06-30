const Order = require("../models/Order");

const getInvoiceByPublicId = async (req, res) => {
  try {
    const order = await Order.findOne({
      publicInvoiceId: req.params.publicInvoiceId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,

      invoice: {
        orderNumber: order.orderNumber,

        customerName: order.customerName,

        dressType: order.dressType,

        orderDate: order.orderDate,

        deliveryDate: order.deliveryDate,

        totalAmount: order.payment.totalAmount,

        advancePaid:
          order.payment.advance.amount,

        advancePaymentMode:
          order.payment.advance.mode,

        remainingAmount:
          order.payment.remaining.amount,

        remainingPaymentMode:
          order.payment.remaining.mode,

        invoiceStatus:
          order.invoiceStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getInvoiceByPublicId,
};