const User = require("../models/User");
const Product = require("../models/productModel");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Subscription = require("../models/Subscription");
const asyncHandler = require("../utils/asyncHandler");

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const getLastSixMonths = () => {
  const months = [];
  const currentDate = new Date();

  currentDate.setDate(1);

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - index);

    months.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: monthFormatter.format(date),
      revenue: 0,
      orders: 0,
    });
  }

  return months;
};

const mapMonthlySales = (monthlySalesResult) => {
  const months = getLastSixMonths();

  monthlySalesResult.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    const month = months.find((monthItem) => monthItem.key === key);

    if (month) {
      month.revenue = item.revenue;
      month.orders = item.orders;
    }
  });

  return months.map(({ key, ...month }) => month);
};

const mapOrdersByStatus = (ordersByStatusResult) => {
  const statuses = ["pending", "processing", "shipped", "delivered"];

  return statuses.map((status) => {
    const match = ordersByStatusResult.find((item) => item._id === status);

    return {
      status,
      count: match?.count || 0,
    };
  });
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalInvoices,
    activeSubscriptions,
    revenueResult,
    monthlySalesResult,
    ordersByStatusResult,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Invoice.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalInvoices,
    activeSubscriptions,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    monthlySales: mapMonthlySales(monthlySalesResult),
    ordersByStatus: mapOrdersByStatus(ordersByStatusResult),
  });
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(orders);
});

module.exports = {
  getDashboardStats,
  getRecentOrders,
};
