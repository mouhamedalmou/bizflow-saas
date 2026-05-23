const { body, param } = require("express-validator");

const productIdParam = [
  param("id").isMongoId().withMessage("Valid product id is required"),
];

const createProductValidation = [
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
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("image").optional().isString().withMessage("Image must be a string"),
];

const updateProductValidation = [
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
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("image").optional().isString().withMessage("Image must be a string"),
];

module.exports = {
  productIdParam,
  createProductValidation,
  updateProductValidation,
};
