const Order = require("../models/Order");

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.payment.totalAmount,
      0
    );

    const todaysCutting = orders.filter(
      (order) =>
        order.cuttingDate >= startOfDay &&
        order.cuttingDate <= endOfDay
    ).length;

    const todaysDeliveries = orders.filter(
      (order) =>
        order.deliveryDate >= startOfDay &&
        order.deliveryDate <= endOfDay
    ).length;

    let todaysPayments = 0;

    orders.forEach((order) => {
      order.payment.transactions.forEach((transaction) => {
        const txDate = new Date(transaction.date);

        if (
          txDate >= startOfDay &&
          txDate <= endOfDay
        ) {
          todaysPayments += transaction.amount;
        }
      });
    });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "orderNumber customerName status deliveryDate payment.totalAmount"
      );

    res.status(200).json({
      totalOrders,
      totalRevenue,
      todaysCutting,
      todaysDeliveries,
      todaysPayments,
      recentOrders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getDashboardData,
};