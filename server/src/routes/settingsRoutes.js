const express = require("express");

const {
  getCurrentOrderNumber,
  updateCurrentOrderNumber,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/order-number", getCurrentOrderNumber);

router.put("/order-number", updateCurrentOrderNumber);

module.exports = router;