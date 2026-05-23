const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  userIdParam,
  updateUserValidation,
} = require("../validations/userValidation");

const router = express.Router();

router.route("/").get(protect, adminOnly, getUsers);

router
  .route("/:id")
  .get(protect, adminOnly, userIdParam, validateMiddleware, getUserById)
  .put(
    protect,
    adminOnly,
    userIdParam,
    updateUserValidation,
    validateMiddleware,
    updateUser
  )
  .delete(protect, adminOnly, userIdParam, validateMiddleware, deleteUser);

module.exports = router;
