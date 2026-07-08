const express = require("express");
const { createOrder, 
        getOrders, 
        updateOrder, 
        getTodayCuttings, 
        getOrderById, 
        completeCutting, 
        getTodayDeliveries, 
        addPayment, 
        deliverItem, 
        markGarmentReady 
    } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/cuttings/today", getTodayCuttings);

router.get("/deliveries/today", getTodayDeliveries);

router.post("/:orderId/payment", addPayment);

router.get("/:id", getOrderById);

router.put("/:id", updateOrder);

router.put("/:orderId/items/:itemId/complete-cutting", completeCutting);

router.put("/:orderId/items/:itemId/deliver", deliverItem);

router.put("/:orderId/items/:itemId/ready", markGarmentReady);

module.exports = router;