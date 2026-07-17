const { body, param } = require("express-validator");

const createSubscriptionValidation = [
  body("planCode").trim().notEmpty().withMessage("Plan code is required"),
];

const updateSubscriptionStatusValidation = [
  param("id").isMongoId().withMessage("Valid subscription id is required"),
  body("status")
    .isIn(["active", "cancelled", "past_due", "expired"])
    .withMessage("Invalid subscription status"),
];

module.exports = {
  createSubscriptionValidation,
  updateSubscriptionStatusValidation,
};
