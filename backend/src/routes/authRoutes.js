const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { registerUser, loginUser, getMe } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome admin" });
});
module.exports = router;