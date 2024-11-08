const asyncHandler = require("express-async-handler");
const savingsModel = require("../models/savings.model");
const userModel = require("../models/user.model");

// @desc Get all savings for the current user
// @route GET /api/savings
// @access private
const getAllSavings = asyncHandler(async (req, res) => {
  const currentUser = await userModel.findById(req.user._id);
  if (!currentUser) {
    res.status(401);
    throw new Error("User not logged in");
  }

  const savings = await savingsModel.find({ userID: req.user._id });

  if (savings.length === 0) {
    return res.status(200).json({ message: "No savings found for the user", savings });
  }

  res.status(200).json({ message: "Savings found successfully", savings });
});

// @desc Add new savings for the current user
// @route POST /api/savings
// @access private
const addSavings = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Invalid amount");
  }

  const currentUser = await userModel.findById(req.user._id);
  if (!currentUser) {
    res.status(401);
    throw new Error("User not logged in");
  }

  let savings = await savingsModel.findOne({ userID: req.user._id });

  if (savings) {
    // Update existing savings
    savings.amount += amount;
    await savings.save();
  } else {
    // Create new savings
    savings = await savingsModel.create({
      userID: req.user._id,
      amount,
    });
  }

  res.status(201).json({ message: "Savings updated successfully", savings });
});

// @desc Update existing savings for the current user
// @route PATCH /api/savings
// @access private
const updateSavings = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (amount === undefined) {
    res.status(400);
    throw new Error("Invalid amount");
  }

  const currentUser = await userModel.findById(req.user._id);
  if (!currentUser) {
    res.status(401);
    throw new Error("User not logged in");
  }

  const savings = await savingsModel.findOne({ userID: req.user._id });

  if (!savings) {
    return res.status(404).json({ message: "No existing savings found for the user" });
  }

  savings.amount += amount; // Update amount (can be positive or negative)
  await savings.save();

  res.status(200).json({ message: "Savings updated successfully", savings });
});

module.exports = { getAllSavings, addSavings, updateSavings };