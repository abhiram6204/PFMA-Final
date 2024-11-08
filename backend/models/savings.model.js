const mongoose = require("mongoose");

const savingsSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  });
  
  const savingsModel = mongoose.model('Savings', savingsSchema);
  module.exports = savingsModel;
  