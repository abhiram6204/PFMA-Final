const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default:Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  });
  
  const expenseModel = mongoose.model('Expense', expenseSchema);
  module.exports = expenseModel;
  