const express = require('express');

const { getAllExpenses, getExpense, addExpense, updateExpense, deleteExpense } = require("../controllers/expense.controller");
const router = express.Router();


router.route("/")
    .get(getAllExpenses)
    .post(addExpense);
router.route("/:id")
    .get(getExpense)
    .patch(updateExpense)
    .delete(deleteExpense);

module.exports = router;
