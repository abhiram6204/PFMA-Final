const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  goalName: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

const goalModel = mongoose.model("Goal", goalSchema);
module.exports = goalModel;
