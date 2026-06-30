const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  totalAmount: {
    type: Number,
    required: true,
  },

  advance: {
    amount: {
      type: Number,
      default: 0,
    },

    mode: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
  },

  remaining: {
    amount: {
      type: Number,
      default: 0,
    },

    mode: {
      type: String,
      enum: ["Cash", "Online", null],
      default: null,
    },
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    publicInvoiceId: {
      type: String,
      unique: true,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
    },

    dressType: {
      type: String,
      required: true,
    },

    measurements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    fabricImageUrl: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    orderDate: {
      type: Date,
      required: true,
    },

    deliveryDate: {
      type: Date,
      required: true,
    },

    cuttingDate: {
      type: Date,
      required: true,
    },

    payment: paymentSchema,

    status: {
      type: String,
      enum: [
        "Pending",
        "Cutting",
        "Stitching",
        "Ready",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    isCuttingCompleted: {
        type: Boolean,
        default: false,
    },

    invoiceStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);