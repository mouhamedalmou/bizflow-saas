const { body, param } = require("express-validator");

export const userIdParam = [
  param("id").isMongoId().withMessage("Valid user id is required"),
];

export const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("role")
    .optional()
    .isIn(["customer", "admin"])
    .withMessage("Role must be customer or admin"),
];

module.exports = {
  userIdParam,
  updateUserValidation,
};
