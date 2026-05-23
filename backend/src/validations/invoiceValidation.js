const { body } = require("express-validator");

const createInvoiceFromOrderValidation = [
  body("orderId").isMongoId().withMessage("Valid order id is required"),
];

module.exports = {
  createInvoiceFromOrderValidation,
};
