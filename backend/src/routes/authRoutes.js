const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  registerValidation,
  loginValidation,
} = require("../validations/authValidation");

const router = express.Router();

router.post("/register", registerValidation, validateMiddleware, registerUser);
router.post("/login", loginValidation, validateMiddleware, loginUser);
router.get("/me", protect, getMe);
router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome admin" });
});
module.exports = router;
