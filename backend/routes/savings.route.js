const express = require("express");
const { getAllSavings, addSavings, updateSavings } = require("../controllers/savings.controller");
const router = express.Router();

router
  .route("/")
  .get(getAllSavings)
  .post(addSavings)
  .patch(updateSavings);

module.exports = router;
