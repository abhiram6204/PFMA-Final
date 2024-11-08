const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    source: {
      type: String
    },
    description: {
      type: String,
      default: ''
    }
  });
  
  const incomeModel = mongoose.model('Income', incomeSchema);
  module.exports = incomeModel;
  