const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validations/authValidation");

const router = express.Router();

router.post("/register", registerValidation, validateMiddleware, registerUser);
router.post("/login", loginValidation, validateMiddleware, loginUser);
router.get("/me", protect, getMe);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateMiddleware,
  forgotPassword
);
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  validateMiddleware,
  resetPassword
);
router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome admin" });
});
module.exports = router;
