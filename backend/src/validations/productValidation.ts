import { body, param } from "express-validator";

export const productIdParam = [
  param("id").isMongoId().withMessage("Valid product id is required"),
];

export const createProductValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be zero or greater")
    .toFloat(),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be zero or greater")
    .toInt(),
  body("category").isMongoId().withMessage("Valid category id is required"),
  body("sku").trim().notEmpty().isLength({ max: 80 }).withMessage("SKU is required and cannot exceed 80 characters"),
  body("imageUrl").optional().isURL({ protocols: ["https"], require_protocol: true }).withMessage("imageUrl must be a valid HTTPS URL"),
  body("image").optional().isURL({ protocols: ["https"], require_protocol: true }).withMessage("Image must be a valid HTTPS URL"),
];

export const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product description cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be zero or greater")
    .toFloat(),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be zero or greater")
    .toInt(),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Valid category id is required"),
  body("sku").optional().trim().notEmpty().isLength({ max: 80 }).withMessage("SKU cannot be empty or exceed 80 characters"),
  body("imageUrl").optional().isURL({ protocols: ["https"], require_protocol: true }).withMessage("imageUrl must be a valid HTTPS URL"),
  body("image").optional().isString().withMessage("Image must be a string"),
];
