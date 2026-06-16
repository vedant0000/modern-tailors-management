const express = require("express");
const { createOrder, getOrders, updateOrder, getTodayCuttings, getOrderById, completeCutting, getTodayDeliveries, completePayment } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/cuttings/today", getTodayCuttings);

router.get("/deliveries/today", getTodayDeliveries);

router.put("/:id/complete-payment", completePayment);

router.get("/:id", getOrderById);

router.put("/:id", updateOrder);

router.put("/:id/complete-cutting", completeCutting);

module.exports = router;