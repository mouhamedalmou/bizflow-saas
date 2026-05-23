const Order = require("../models/Order");
const Product = require("../models/productModel");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// @desc    Create new order
// @route   POST /api/orders
// @access  Customer/Admin
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  const quantitiesByProduct = new Map();

  for (const item of orderItems) {
    const productId = item.product;
    const quantity = Number(item.quantity);

    quantitiesByProduct.set(
      productId,
      (quantitiesByProduct.get(productId) || 0) + quantity
    );
  }

  let totalPrice = 0;
  const items = [];
  const productsToUpdate = [];

  for (const [productId, quantity] of quantitiesByProduct) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, `Product not found: ${productId}`);
    }

    if (product.stock < quantity) {
      throw new ApiError(400, `Not enough stock for ${product.name}`);
    }

    totalPrice += product.price * quantity;

    items.push({
      product: product._id,
      name: product.name,
      quantity,
      price: product.price,
    });

    productsToUpdate.push({ product, quantity });
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: items,
    totalPrice,
  });

  for (const { product, quantity } of productsToUpdate) {
    product.stock -= quantity;
    await product.save();
  }

  res.status(201).json(order);
});

// @desc    Get logged user orders
// @route   GET /api/orders/my-orders
// @access  Customer/Admin
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
