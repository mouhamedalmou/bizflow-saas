import { body, param } from "express-validator";

export const createSubscriptionValidation = [
  body("planCode").trim().notEmpty().withMessage("Plan code is required"),
];

export const updateSubscriptionStatusValidation = [
  param("id").isMongoId().withMessage("Valid subscription id is required"),
  body("status")
    .isIn(["active", "cancelled", "past_due", "expired"])
    .withMessage("Invalid subscription status"),
];
