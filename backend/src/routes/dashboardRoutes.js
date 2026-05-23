const express = require("express");
const {
  getDashboardStats,
  getRecentOrders,
} = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/recent-orders", protect, adminOnly, getRecentOrders);

module.exports = router;
