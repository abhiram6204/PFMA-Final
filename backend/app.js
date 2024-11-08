// require('dotenv').config();
// const crypto = require('crypto');

// // Access the encryption key from the environment variable
// const secretKey = process.env.ENCRYPTION_KEY;

// // Function to encrypt amount
// function encryptAmount(amount) {
//     const iv = crypto.randomBytes(16);
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
//     let encrypted = cipher.update(amount.toString(), 'utf-8', 'hex');
//     encrypted += cipher.final('hex');
//     return {
//         iv: iv.toString('hex'),
//         encryptedData: encrypted
//     };
// }

// // Example usage
// const encryptedAmount = encryptAmount(1500.75);
// console.log(encryptedAmount);


const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors=require("cors")
require("dotenv").config();
const errorHandler = require("./middleware/errorHandling");

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
app.use(express.json());

const userRoutes = require("./routes/user.routes");
const expenseRoutes = require("./routes/expense.routes");
const incomeRoutes = require("./routes/income.routes");
const budgetRoutes = require("./routes/budget.routes");
const savingRoutes = require("./routes/saving.routes");
const goalRoutes = require("./routes/goal.routes");
const savingsRoutes=require("./routes/savings.route")
// const dashboardRoutes = require("./routes/dashboard.routes");
const { validateToken } = require("./middleware/validateToken");

mongoose
  .connect("mongodb://127.0.0.1:27017/finance-manager")
  .then(() => console.log("Connected to DataBase successfully..."));

// connecting api endpoint to routes
app.use("/api/auth", userRoutes);
app.use("/api/expense", validateToken, expenseRoutes);
app.use("/api/income", validateToken, incomeRoutes);
app.use("/api/budget", validateToken, budgetRoutes);
app.use("/api/saving", validateToken, savingRoutes);
app.use("/api/savings", validateToken, savingsRoutes);
app.use("/api/goal", validateToken, goalRoutes);
// app.use("/api/dashboard", validateToken, dashboardRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
