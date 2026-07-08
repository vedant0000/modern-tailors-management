const mongoose = require("mongoose");

const MeasurementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const ItemSchema = new mongoose.Schema(
  {
    itemNumber: {
      type: Number,
      required: true,
    },

    garmentType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    measurements: {
      type: [MeasurementSchema],
      default: [],
    },

    fabricImageUrl: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    isUrgent: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Cutting",
        "Stitching",
        "Ready",
        "Delivered",
      ],
      default: "Pending",
    },

    isCuttingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const TransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },

    mode: {
      type: String,
      enum: ["Cash", "Online"],
      required: true,
    },

    type: {
      type: String,
      enum: ["Advance", "Partial", "Final"],
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    receivedBy: {
      type: String,
      default: "Admin",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    publicInvoiceId: {
      type: String,
      required: true,
      unique: true,
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

    items: {
      type: [ItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one garment is required.",
      },
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

    payment: {
      totalAmount: {
        type: Number,
        required: true,
      },

      transactions: {
        type: [TransactionSchema],
        default: [],
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Partially Delivered",
        "Delivered",
      ],
      default: "Pending",
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

module.exports = mongoose.model("Order", OrderSchema);