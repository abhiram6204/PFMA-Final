const asyncHandler = require("express-async-handler");
const incomeModel = require("../models/income.model");
const userModel = require("../models/user.model");
const savingsModel = require("../models/savings.model");

// @desc add an income source for the current user
// @route POST /api/income
// @access private
const addIncome = asyncHandler(async (req, res) => {
    let { date, amount, source, description } = req.body;
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not logged in`);
    }
    if (!date) {
        // date = Date.now;
    }
    const income = await incomeModel.create({
        userID: req.user._id,
        date,
        amount,
        source,
        description
    });
    await savingsModel.findOneAndUpdate(
        { userID: req.user._id },
        { $inc: { amount: amount } },
        { upsert: true, new: true } 
    );

    res
    .status(201)
    .json({ message: "Income source successfully added", income });
});

// @desc returning all the income sources for the current user
// @route GET /api/income
// @access private
const getAllIncome = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id);
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not logged in`);
    }
    const income = await incomeModel.find({ userID: currentUser._id })
    if (!income) {
        res.status(200).json({ message: "no Income sources found for the current user", income });
    }
    res.status(200).json({ message: "Income sources successfully returned", income });
})

// @desc returning income source for the current user by id
// @route GET /api/income/:id
// @access private
const getIncome = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not logged in`);
    }
    const income = await incomeModel.find({_id: req.params.id, userID: currentUser._id});
    if (!income) {
        res.status(404);
        throw new Error("Income sources not found");
    }
    res.status(200).json({ message: "Income source found", income });
})

// @desc updating requesting income source
// @route PATCH /api/income/:id
// @access private
const updateIncome = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not logged in`);
    }
    const income = await incomeModel.find({_id: req.params.id, userID: currentUser._id})
    if (!income) {
        res.status(404);
        throw new Error("Income sources not found");
    }
    const updatedIncome = await incomeModel.findByIdAndUpdate(req.params.id, {
        date: req.body.date || income.date,
        amount: req.body.amount || income.amount,
        source: req.body.source || income.source,
        description: req.body.description || income.description,
    }, {new: true});
    res.status(200).json({ message: "Income source successfully updated", updatedIncome });
})

// @desc deleting the requested income source
// @route DELETE /api/income/:id
// @access private
const deleteIncome = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id);
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not logged in`);
    }
    const income = await incomeModel.findByIdAndDelete({_id: req.params.id, userID: currentUser._id})
    if (!income) {
        res.status(404);
        throw new Error("Income sources not found");
    }
    res.status(200).json({message: "Income source deleted successfully", income});
})

module.exports = { addIncome, getAllIncome, getIncome, updateIncome, deleteIncome }
