const express = require("express");
const {
  createInvoiceFromOrder,
  getAllInvoices,
  getMyInvoices,
} = require("../controllers/invoiceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  createInvoiceFromOrderValidation,
} = require("../validations/invoiceValidation");

const router = express.Router();

router.get("/", protect, adminOnly, getAllInvoices);
router.get("/my-invoices", protect, getMyInvoices);
router.post(
  "/from-order",
  protect,
  adminOnly,
  createInvoiceFromOrderValidation,
  validateMiddleware,
  createInvoiceFromOrder
);

module.exports = router;
