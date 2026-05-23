const Product = require("../models/productModel");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, image } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    image,
  });

  res.status(201).json(product);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public/Protected
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  res.status(200).json(products);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.deleteOne();

  res.status(200).json({ message: "Product deleted successfully" });
});

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
