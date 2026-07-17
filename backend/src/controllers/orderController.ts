import type { Request, Response } from "express";
import type { ClientSession } from "mongoose";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/productModel";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import type { ApiResponse, CreateOrderDto, IdParams, IOrder, IOrderItem, UpdateOrderStatusDto } from "../types";

export const createOrder = asyncHandler(async (req: Request<Record<string, never>, IOrder, CreateOrderDto>, res: Response<IOrder>) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const requested = req.body.items ?? req.body.orderItems ?? []; if (!requested.length) throw new ApiError(400, "Order must contain at least one item");
  const session: ClientSession = await mongoose.startSession();
  try {
    let created: IOrder | undefined;
    await session.withTransaction(async () => {
      const items: IOrderItem[] = []; let totalPrice = 0;
      for (const requestedItem of requested) {
        const productId = requestedItem.productId ?? requestedItem.product;
        const product = await Product.findOneAndUpdate({ _id: productId, stock: { $gte: requestedItem.quantity } }, { $inc: { stock: -requestedItem.quantity } }, { new: true, session });
        if (!product) throw new ApiError(400, `Product unavailable or insufficient stock: ${productId}`);
        const item: IOrderItem = { productId: product._id, product: product._id, name: product.name, quantity: requestedItem.quantity, price: product.price }; items.push(item); totalPrice += product.price * requestedItem.quantity;
      }
      [created] = await Order.create([{ userId: req.user?._id, user: req.user?._id, items, orderItems: items, totalPrice }], { session });
    });
    if (!created) throw new ApiError(500, "Order creation failed"); res.status(201).json(created);
  } finally { await session.endSession(); }
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response<IOrder[]>) => { if (!req.user) throw new ApiError(401, "Not authenticated"); const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }); res.json(orders); });
export const getAllOrders = asyncHandler(async (_req: Request, res: Response<IOrder[]>) => { const orders = await Order.find().populate("user", "name email role avatar").sort({ createdAt: -1 }); res.json(orders); });
export const getOrderById = asyncHandler(async (req: Request<IdParams>, res: Response<ApiResponse<IOrder>>) => { const order = await Order.findById(req.params.id).populate("user", "name email role avatar"); if (!order) throw new ApiError(404, "Order not found"); if (req.user?.role !== "admin" && String(order.userId) !== req.user?.id) throw new ApiError(403, "Not authorized to view this order"); res.json({ success: true, data: order }); });
export const updateOrderStatus = asyncHandler(async (req: Request<IdParams, IOrder, UpdateOrderStatusDto>, res: Response<IOrder>) => { const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!order) throw new ApiError(404, "Order not found"); res.json(order); });
export const cancelOrder = asyncHandler(async (req: Request<IdParams>, res: Response<ApiResponse<never>>) => { const order = await Order.findById(req.params.id); if (!order) throw new ApiError(404, "Order not found"); if (req.user?.role !== "admin" && String(order.userId) !== req.user?.id) throw new ApiError(403, "Not authorized"); if (!["pending", "processing"].includes(order.status)) throw new ApiError(409, "Order can no longer be cancelled"); order.status = "cancelled"; await order.save(); res.json({ success: true, message: "Order cancelled" }); });
