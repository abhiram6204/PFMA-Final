const express = require("express");

const {
  getIncome,
  getAllIncome,
  addIncome,
  updateIncome,
  deleteIncome
} = require("../controllers/income.controller");
const router = express.Router();

router.post("/", addIncome)
  .get("/", getAllIncome);
router.route("/:id")
  .get(getIncome)
  .patch(updateIncome)
  .delete(deleteIncome);

module.exports = router;
