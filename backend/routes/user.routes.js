const express = require("express");
const {validateToken} = require("../middleware/validateToken")

const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser
} = require("../controllers/user.controller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.use(validateToken);
router.get("/current", currentUser);
router.post("/logout", logoutUser);

module.exports = router;
