const express = require("express");

const {
  getGoal,
  getAllGoals,
  addGoal,
  updateGoal,
  deleteGoal
} = require("../controllers/goal.controller");
const router = express.Router();

router.post("/", addGoal)
  .get("/", getAllGoals);
router.route("/:id")
  .get(getGoal)
  .patch(updateGoal)
  .delete(deleteGoal);

module.exports = router;
