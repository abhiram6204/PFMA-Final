const asyncHandler = require("express-async-handler");
const goalModel = require("../models/goal.model");
const userModel = require("../models/user.model");

// @desc add a goal for the current user
// @route POST /api/goal
// @access private
const addGoal = asyncHandler(async (req, res) => {
    let { goalName, targetAmount, currentAmount, targetDate, startDate, description } = req.body;
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not Logged in`);
    }
    const goal = await goalModel.create({
        userID: req.user._id,
        goalName,
        targetAmount,
        currentAmount,
        targetDate,
        startDate,
        description
    });
    res
        .status(201)
        .json({message: "Goal set successfully", goal});
});

// @desc get all goals for the current user
// @route GET /api/goal
// @access private
const getAllGoals = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not Logged in`);
    }
    const goals = await goalModel.find({ userID: currentUser._id })
    if (!goals) {
        res.status(200).json({message: "no goals found", goals});
    }
    res.status(200).json({message: "Goals found", goals});
})

// @desc get a goal for the current user
// @route GET /api/goal/:id
// @access private
const getGoal = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not Logged in`);
    }
    const goal = await goalModel.find({_id: req.params.id, userID: currentUser._id})
    if (goal.length === 0) {
        res.status(404);
        throw new Error("Invalid Goal id");
    }
    res.status(200).json({message: "Goal found", goal});
})

// @desc update a requested goal
// @route PATCH /api/goal/:id
// @access private
const updateGoal = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not Logged in`);
    }
    const goal = await goalModel.find({_id: req.params.id, userID: currentUser._id})
    if (!goal) {
        res.status(404);
        throw new Error("Goal not found");
    }
    
    const updatedGoal = await goalModel.findByIdAndUpdate(req.params.id, {
        goalName: req.body.goalName || goal.goalName,
    targetAmount: req.body.targetAmount || goal.targetAmount,
    currentAmount: req.body.currentAmount || goal.currentAmount,
    startDate: req.body.startDate || goal.startDate,
    targetDate: req.body.targetDate || goal.targetDate,
    description: req.body.description || goal.description,
    }, {new: true})
    res.status(200).json({message: "Goal successfully updated", updatedGoal});
})

// @desc delete a requested goal
// @route DELETE /api/goal/:id
// @access private
const deleteGoal = asyncHandler(async (req, res) => {
    const currentUser = await userModel.findById(req.user._id)
    if (!currentUser) {
        res.status(401);
        throw new Error(`User not Logged in`);
    }
    const goal = await goalModel.find({_id: req.params.id, userID: currentUser._id})
    if (!goal) {
        res.status(404);
        throw new Error("Goal not found");
    }
    const deletedGoal = await goalModel.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "Goal removed successfully", deletedGoal});
})

module.exports = { addGoal, getAllGoals, getGoal, updateGoal, deleteGoal }