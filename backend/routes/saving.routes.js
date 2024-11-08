const express = require("express");

const {
  getSaving,
  getAllSavings,
  addSaving,
  updateSaving,
  deleteSaving,
} = require("../controllers/saving.controller");
const router = express.Router();

router.get("/", getAllSavings).post("/", addSaving);
router.route("/:id").get(getSaving).patch(updateSaving).delete(deleteSaving);

module.exports = router;
