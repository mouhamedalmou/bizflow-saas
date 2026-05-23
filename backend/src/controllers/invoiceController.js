const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
};

const createInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

// @desc    Create invoice from order
// @route   POST /api/invoices/from-order
// @access  Admin
const createInvoiceFromOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId).populate("user", "name email role");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const existingInvoice = await Invoice.findOne({ order: order._id });

  if (existingInvoice) {
    throw new ApiError(400, "Invoice already exists for this order");
  }

  const invoice = await Invoice.create({
    invoiceNumber: createInvoiceNumber(),
    order: order._id,
    user: order.user._id,
    items: order.orderItems.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: order.totalPrice,
    total: order.totalPrice,
    status: order.paymentStatus === "paid" ? "paid" : "issued",
    dueDate: getDueDate(),
    paidAt: order.paymentStatus === "paid" ? new Date() : undefined,
  });

  res.status(201).json(invoice);
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Admin
const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find()
    .populate("user", "name email role")
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(invoices);
});

// @desc    Get logged user invoices
// @route   GET /api/invoices/my-invoices
// @access  Customer/Admin
const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate("order")
    .sort({ createdAt: -1 });

  res.json(invoices);
});

module.exports = {
  createInvoiceFromOrder,
  getAllInvoices,
  getMyInvoices,
};
