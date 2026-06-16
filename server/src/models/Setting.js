const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  currentOrderNumber: {
    type: Number,
    default: 9000,
  },
});

module.exports = mongoose.model("Setting", settingSchema);