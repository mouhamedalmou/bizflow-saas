import type { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/productModel";
import asyncHandler from "../utils/asyncHandler";
import type { ApiResponse, RevenueQuery } from "../types";

interface Stats { totalRevenue: number; revenue: number; totalOrders: number; activeOrders: number; lowStockCount: number; lowStockProducts: number }
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response<ApiResponse<Stats>>) => {
  const [revenue, totalOrders, activeOrders, lowStockCount] = await Promise.all([
    Order.aggregate<{ total: number }>([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.countDocuments(), Order.countDocuments({ status: { $in: ["pending", "processing", "shipped"] } }), Product.countDocuments({ stock: { $lte: 5 } }),
  ]);
  const totalRevenue = revenue[0]?.total ?? 0; res.json({ success: true, data: { totalRevenue, revenue: totalRevenue, totalOrders, activeOrders, lowStockCount, lowStockProducts: lowStockCount } });
});

const periodFormat = { day: "%Y-%m-%d", week: "%G-W%V", month: "%Y-%m" } as const;
export const getRevenue = asyncHandler(async (req: Request<Record<string, never>, unknown, Record<string, never>, RevenueQuery>, res: Response) => {
  const period = req.query.period ?? "month"; const data = await Order.aggregate<{ period: string; revenue: number; orders: number }>([
    { $match: { status: { $ne: "cancelled" } } }, { $group: { _id: { $dateToString: { format: periodFormat[period], date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } }, { $project: { _id: 0, period: "$_id", revenue: 1, orders: 1 } }, { $sort: { period: 1 } },
  ]); res.json({ success: true, data });
});

export const getOrdersTrend = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date(); since.setDate(since.getDate() - 29); since.setHours(0, 0, 0, 0);
  const data = await Order.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } }, { $project: { _id: 0, date: "$_id", orders: 1, revenue: 1 } }, { $sort: { date: 1 } }]); res.json({ success: true, data });
});

export const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $unwind: "$orderItems" }, { $group: { _id: "$orderItems.product", name: { $first: "$orderItems.name" }, unitsSold: { $sum: "$orderItems.quantity" }, revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } } } }, { $sort: { unitsSold: -1 } }, { $limit: 10 }]); res.json({ success: true, data });
});

export const getRecentOrders = asyncHandler(async (_req: Request, res: Response) => { const orders = await Order.find().populate("user", "name email role avatar").sort({ createdAt: -1 }).limit(10); res.json(orders); });
