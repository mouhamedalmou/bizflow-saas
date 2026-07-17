import express from "express";
import {
  createInvoiceFromOrder,
  getAllInvoices,
  getMyInvoices,
} from "../controllers/invoiceController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import validateMiddleware from "../middleware/validateMiddleware";
import {
  createInvoiceFromOrderValidation,
} from "../validations/invoiceValidation";

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

export default router;
