const express = require("express");

const {
  getSavings,
  getExpenses,
  getIncome,
  getSummary
} = require("../controllers/saving.controller");
const router = express.Router();

router.get("/summary", getSummary);
router.get("/expenses", getExpenses);
router.get("/income", getIncome);
router.get("/savings", getSavings);

module.exports = router;
