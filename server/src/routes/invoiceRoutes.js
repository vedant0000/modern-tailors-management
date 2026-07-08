const express = require("express");

const router = express.Router();

const {
  getPublicInvoice,
} = require("../controllers/invoiceController");

router.get(
  "/:publicInvoiceId",
  getPublicInvoice
);

module.exports = router;