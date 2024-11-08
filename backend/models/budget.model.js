const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    spentAmount: {
        type: Number,
        required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    }
  });
  
  const budgetModel = mongoose.model('Budget', budgetSchema);
  module.exports = budgetModel;
  


// const mongoose = require("mongoose");
// const crypto = require('crypto');
// require('dotenv').config(); // Load environment variables

// // Load the encryption key from environment variables
// const secretKey = process.env.ENCRYPTION_KEY;

// // Helper function to encrypt data
// function encryptData(data) {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
//   let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return { iv: iv.toString('hex'), encryptedData: encrypted };
// }

// // Helper function to decrypt data
// function decryptData(iv, encryptedData) {
//   const ivBuffer = Buffer.from(iv, 'hex');
//   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), ivBuffer);
//   let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return parseFloat(decrypted);
// }

// // Define the Budget schema with encrypted fields
// const budgetSchema = new mongoose.Schema({
//     userID: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     category: {
//       type: String,
//       required: true
//     },
//     amount: {
//       iv: { type: String, required: true },          // Store the IV for 'amount'
//       encryptedData: { type: String, required: true } // Encrypted 'amount'
//     },
//     spentAmount: {
//       iv: { type: String, required: true },          // Store the IV for 'spentAmount'
//       encryptedData: { type: String, required: true } // Encrypted 'spentAmount'
//     },
//     startDate: {
//       type: Date,
//       required: true,
//       default: Date.now
//     },
//     endDate: {
//       type: Date,
//       required: true
//     }
// });

// // Pre-save hook to encrypt amount and spentAmount before saving
// budgetSchema.pre('save', function (next) {
//   if (this.isModified('amount')) {
//     const encryptedAmount = encryptData(this.amount);
//     this.amount = encryptedAmount;
//   }
  
//   if (this.isModified('spentAmount')) {
//     const encryptedSpentAmount = encryptData(this.spentAmount);
//     this.spentAmount = encryptedSpentAmount;
//   }
//   next();
// });

// // Method to decrypt and get the original amount
// budgetSchema.methods.getDecryptedAmount = function () {
//   return decryptData(this.amount.iv, this.amount.encryptedData);
// };

// // Method to decrypt and get the original spentAmount
// budgetSchema.methods.getDecryptedSpentAmount = function () {
//   return decryptData(this.spentAmount.iv, this.spentAmount.encryptedData);
// };

// // Export the budget model
// const budgetModel = mongoose.model('Budget', budgetSchema);
// module.exports = budgetModel;
