import type { Request, Response } from "express";
import User from "../models/User";
import Product from "../models/productModel";
import Order from "../models/Order";
import Invoice from "../models/Invoice";
import Subscription from "../models/Subscription";
import asyncHandler from "../utils/asyncHandler";
import type { ApiResponse, OrderStatus, RevenueQuery } from "../types";

interface MonthlyAggregate {
  _id: { year: number; month: number };
  revenue: number;
  orders: number;
}

interface StatusAggregate { _id: OrderStatus; count: number }
interface MonthlySale { month: string; revenue: number; orders: number }
interface StatusCount { status: OrderStatus; count: number }

interface Stats {
  totalRevenue: number;
  revenue: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  activeOrders: number;
  totalInvoices: number;
  activeSubscriptions: number;
  lowStockCount: number;
  lowStockProducts: number;
  monthlySales: MonthlySale[];
  ordersByStatus: StatusCount[];
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const visibleStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const getLastSixMonths = (): Array<MonthlySale & { key: string }> => {
  const current = new Date();
  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(current);
    date.setMonth(current.getMonth() - (5 - index));
    return { key: `${date.getFullYear()}-${date.getMonth() + 1}`, month: monthFormatter.format(date), revenue: 0, orders: 0 };
  });
};

const mapMonthlySales = (results: MonthlyAggregate[]): MonthlySale[] => {
  const resultByMonth = new Map(results.map((item) => [`${item._id.year}-${item._id.month}`, item]));
  return getLastSixMonths().map(({ key, month }) => {
    const result = resultByMonth.get(key);
    return { month, revenue: result?.revenue ?? 0, orders: result?.orders ?? 0 };
  });
};

const mapOrdersByStatus = (results: StatusAggregate[]): StatusCount[] => {
  const resultByStatus = new Map(results.map((item) => [item._id, item.count]));
  return visibleStatuses.map((status) => ({ status, count: resultByStatus.get(status) ?? 0 }));
};

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response<ApiResponse<Stats>>) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    activeOrders,
    totalInvoices,
    activeSubscriptions,
    lowStockCount,
    revenue,
    monthlySales,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ["pending", "processing", "shipped"] } }),
    Invoice.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.aggregate<{ total: number }>([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate<MonthlyAggregate>([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: "cancelled" } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Order.aggregate<StatusAggregate>([
      { $match: { status: { $in: visibleStatuses } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = revenue[0]?.total ?? 0;
  res.json({
    success: true,
    data: {
      totalRevenue,
      revenue: totalRevenue,
      totalUsers,
      totalProducts,
      totalOrders,
      activeOrders,
      totalInvoices,
      activeSubscriptions,
      lowStockCount,
      lowStockProducts: lowStockCount,
      monthlySales: mapMonthlySales(monthlySales),
      ordersByStatus: mapOrdersByStatus(ordersByStatus),
    },
  });
});

const periodFormat = { day: "%Y-%m-%d", week: "%G-W%V", month: "%Y-%m" } as const;
export const getRevenue = asyncHandler(async (req: Request<Record<string, never>, unknown, Record<string, never>, RevenueQuery>, res: Response) => {
  const period = req.query.period ?? "month";
  const data = await Order.aggregate<{ period: string; revenue: number; orders: number }>([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: { $dateToString: { format: periodFormat[period], date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
    { $project: { _id: 0, period: "$_id", revenue: 1, orders: 1 } },
    { $sort: { period: 1 } },
  ]);
  res.json({ success: true, data });
});

export const getOrdersTrend = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    { $project: { _id: 0, date: "$_id", orders: 1, revenue: 1 } },
    { $sort: { date: 1 } },
  ]);
  res.json({ success: true, data });
});

export const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$orderItems" },
    { $group: { _id: "$orderItems.product", name: { $first: "$orderItems.name" }, unitsSold: { $sum: "$orderItems.quantity" }, revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } } } },
    { $sort: { unitsSold: -1 } },
    { $limit: 10 },
  ]);
  res.json({ success: true, data });
});

export const getRecentOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user", "name email role avatar").sort({ createdAt: -1 }).limit(10);
  res.json(orders);
});
