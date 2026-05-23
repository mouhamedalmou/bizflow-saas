const { body, param } = require("express-validator");

const createOrderValidation = [
  body("orderItems")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("orderItems.*.product")
    .isMongoId()
    .withMessage("Valid product id is required"),
  body("orderItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
    .toInt(),
];

const updateOrderStatusValidation = [
  param("id").isMongoId().withMessage("Valid order id is required"),
  body("status")
    .isIn(["pending", "processing", "shipped", "delivered"])
    .withMessage("Invalid order status"),
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
};
