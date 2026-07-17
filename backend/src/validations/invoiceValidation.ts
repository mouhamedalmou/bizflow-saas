import { body } from "express-validator";

export const createInvoiceFromOrderValidation = [
  body("orderId").isMongoId().withMessage("Valid order id is required"),
];
