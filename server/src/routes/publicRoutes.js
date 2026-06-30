const express = require("express");

const {
  getInvoiceByPublicId,
} = require("../controllers/publicController");

const router = express.Router();

router.get(
  "/invoice/:publicInvoiceId",
  getInvoiceByPublicId
);

module.exports = router;