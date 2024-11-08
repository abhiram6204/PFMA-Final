const asyncHandler = require("express-async-handler");
const expenseModel = require('../models/expense.model');
const userModel = require("../models/user.model");

// @desc returning all the expenses for the current user
// @route GET /api/expense
// @access private
const getAllExpenses = asyncHandler(async (req, res) => {
    const expenses = await expenseModel.find({ userID: req.user._id });
    
    if (!expenses || expenses.length === 0) {
        return res.status(200).json({ message: "No expenses found for the current user", expenses: [] });
    }

    res.status(200).json({ message: "Expenses found for the current user", expenses });
});

// @desc add an expense for the current user
// @route POST /api/expense
// @access private
const addExpense = asyncHandler(async (req, res) => {
    const expense = new expenseModel({
        userID: req.user._id,
        date: req.body.date,
        amount: req.body.amount,
        category: req.body.category,
        description: req.body.description || " "
    });

    const newExpense = await expense.save();
    res.status(201).json({ message: "Expense added successfully", newExpense });
});

// @desc returning the expense requested for the current user
// @route GET /api/expense/:id
// @access private
const getExpense = asyncHandler(async (req, res) => {
    const expense = await expenseModel.findOne({ _id: req.params.id, userID: req.user._id });
    
    if (!expense) {
        return res.status(404).json({ message: 'Expense not found for the current user' });
    }

    res.status(200).json({ message: "Expense found for the current user", expense });
});

// @desc updating the requested expense
// @route PATCH /api/expense/:id
// @access private
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseModel.findOne({ _id: req.params.id, userID: req.user._id });

    if (!expense) {
        return res.status(404).json({ message: "Expense not found for the user" });
    }

    // Update fields only if they exist in the request body
    expense.amount = req.body.amount || expense.amount;
    expense.date = req.body.date || expense.date;
    expense.category = req.body.category || expense.category;
    expense.description = req.body.description || expense.description;

    const updatedExpense = await expense.save();
    res.status(200).json({ message: "Expense updated successfully", updatedExpense });
});

// @desc deleting the requested expense
// @route DELETE /api/expense/:id
// @access private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await expenseModel.findOneAndDelete({ _id: req.params.id, userID: req.user._id });

    if (!expense) {
        return res.status(404).json({ message: "Expense not found for the user" });
    }

    res.status(200).json({ message: "Expense deleted successfully", expense });
});

module.exports = {
    getAllExpenses,
    addExpense,
    getExpense,
    updateExpense,
    deleteExpense
};
