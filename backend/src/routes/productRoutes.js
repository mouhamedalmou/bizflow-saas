const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  productIdParam,
  createProductValidation,
  updateProductValidation,
} = require("../validations/productValidation");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    adminOnly,
    createProductValidation,
    validateMiddleware,
    createProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .put(
    protect,
    adminOnly,
    productIdParam,
    updateProductValidation,
    validateMiddleware,
    updateProduct
  )
  .delete(protect, adminOnly, productIdParam, validateMiddleware, deleteProduct);

module.exports = router;
