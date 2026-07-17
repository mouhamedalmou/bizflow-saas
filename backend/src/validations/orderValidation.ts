import { body, param } from "express-validator";

export const createOrderValidation = [
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
  body("shippingAddress.street").trim().notEmpty().withMessage("Shipping street is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("Shipping city is required"),
  body("shippingAddress.zip").trim().notEmpty().withMessage("Shipping ZIP is required"),
  body("shippingAddress.country").trim().notEmpty().withMessage("Shipping country is required"),
  body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
];

export const updateOrderStatusValidation = [
  param("id").isMongoId().withMessage("Valid order id is required"),
  body("status")
    .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
];
