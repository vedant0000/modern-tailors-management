const Order = require("../models/Order");

const getPublicInvoice = async (req, res) => {
  try {
    const { publicInvoiceId } = req.params;

    const order = await Order.findOne({
        publicInvoiceId,
    }).lean();

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

    const remainingAmount = order.payment.totalAmount - paidAmount;

    const invoice = {
        orderNumber: order.orderNumber,

        customerName: order.customerName,

        orderDate: order.orderDate,

        deliveryDate: order.deliveryDate,

        items: order.items.map((item) => ({
            itemNumber: item.itemNumber,

            garmentType: item.garmentType,

            quantity: item.quantity,

            unitPrice: item.unitPrice,

            subtotal: item.subtotal,

            status: item.status,
        })),

        payment: {
            totalAmount: order.payment.totalAmount,

            paidAmount,

            remainingAmount,

            transactions: order.payment.transactions.map(
            (transaction) => ({
                amount: transaction.amount,

                mode: transaction.mode,

                type: transaction.type,

                date: transaction.date,
            })
            ),
        },

        invoiceStatus: order.invoiceStatus,
    };

    res.status(200).json({
      success: true,
      invoice: {
        orderNumber: order.orderNumber,

        customerName: order.customerName,

        orderDate: order.orderDate,

        deliveryDate: order.deliveryDate,

        items: order.items.map((item) => ({
            itemNumber: item.itemNumber,

            garmentType: item.garmentType,

            quantity: item.quantity,

            unitPrice: item.unitPrice,

            subtotal: item.subtotal,

            status: item.status,
        })),

        payment: {
          totalAmount: order.payment.totalAmount,

          paidAmount,

          remainingAmount,

          transactions: order.payment.transactions.map((transaction) => ({
                amount: transaction.amount,
                mode: transaction.mode,
                type: transaction.type,
                date: transaction.date,
            })),
        },

        invoiceStatus: order.invoiceStatus,
      },

      
    });
  } catch (error) {
    res.status(200).json({
        success: true,
        invoice,
    });
  }
};

module.exports = {
  getPublicInvoice,
};