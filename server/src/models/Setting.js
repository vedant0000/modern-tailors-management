const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  currentOrderNumber: {
    type: Number,
    default: 9000,
  },

  shopName: {
    type: String,
    default: "Modern Tailors",
  },

  ownerName: {
    type: String,
    default: "",
  },

  mobileNumber: {
    type: String,
    default: "",
  },

  address: {
    type: String,
    default: "",
  },

  upiId: {
    type: String,
    default: "",
  },

  logoUrl: {
    type: String,
    default: "",
  },

  currency: {
    type: String,
    default: "₹",
  },
});

module.exports = mongoose.model("Setting", settingSchema);