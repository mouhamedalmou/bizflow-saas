const express = require("express");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  createOrderValidation,
  updateOrderStatusValidation,
} = require("../validations/orderValidation");

const router = express.Router();

router
  .route("/")
  .post(protect, createOrderValidation, validateMiddleware, createOrder)
  .get(protect, adminOnly, getAllOrders);

router.route("/my-orders").get(protect, getMyOrders);

router
  .route("/:id/status")
  .put(
    protect,
    adminOnly,
    updateOrderStatusValidation,
    validateMiddleware,
    updateOrderStatus
  );

module.exports = router;
