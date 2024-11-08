const express = require("express");

const {
  getBudget,
  getAllBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budget.controller");
const router = express.Router();

router.post("/", addBudget).get("/", getAllBudgets);
router.route("/:id").get(getBudget).patch(updateBudget).delete(deleteBudget);

module.exports = router;
