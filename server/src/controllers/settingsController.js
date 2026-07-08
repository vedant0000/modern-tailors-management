const Setting = require("../models/Setting");

const getCurrentOrderNumber = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({
        currentOrderNumber: 9000,

        shopName: "Modern Tailors",

        ownerName: "",

        mobileNumber: "",

        address: "",

        upiId: "",

        logoUrl: "",

        currency: "₹",
      });
    }

    res.status(200).json({
      success: true,
      currentOrderNumber: settings.currentOrderNumber,
      nextOrderNumber: settings.currentOrderNumber + 1,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCurrentOrderNumber = async (req, res) => {
  try {
    const { currentOrderNumber } = req.body;

    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({
        currentOrderNumber,

        shopName: "Modern Tailors",

        ownerName: "",

        mobileNumber: "",

        address: "",

        upiId: "",

        logoUrl: "",

        currency: "₹",
      });
    } else {
      settings.currentOrderNumber = currentOrderNumber;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      currentOrderNumber: settings.currentOrderNumber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCurrentOrderNumber,
  updateCurrentOrderNumber,
};