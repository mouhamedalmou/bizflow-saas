import type { Request, Response } from "express";
import Product from "../models/productModel";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import type { ApiResponse, IdParams, IProduct, PaginationQuery, ProductDto, UpdateProductDto } from "../types";

export const createProduct = asyncHandler(async (req: Request<Record<string, never>, IProduct, ProductDto>, res: Response<IProduct>) => {
  const imageUrl = req.body.imageUrl ?? req.body.image ?? "";
  const product = await Product.create({ ...req.body, image: imageUrl, imageUrl, sku: req.body.sku ?? `BF-${Date.now().toString(36).toUpperCase()}` });
  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req: Request<Record<string, never>, ApiResponse<IProduct[]> | IProduct[], Record<string, never>, PaginationQuery>, res: Response<ApiResponse<IProduct[]> | IProduct[]>) => {
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter: Record<string, unknown> = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const [products, total] = await Promise.all([Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Product.countDocuments(filter)]);
  if (!req.query.page && !req.query.limit) { res.setHeader("X-Total-Count", total); res.json(products); return; }
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getProductById = asyncHandler(async (req: Request<IdParams, ApiResponse<IProduct>>, res: Response<ApiResponse<IProduct>>) => {
  const product = await Product.findById(req.params.id); if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});

export const getLowStockProducts = asyncHandler(async (req: Request<Record<string, never>, ApiResponse<IProduct[]>, Record<string, never>, { threshold?: string }>, res: Response<ApiResponse<IProduct[]>>) => {
  const threshold = Math.max(0, Number(req.query.threshold) || 5); const products = await Product.find({ stock: { $lte: threshold } }).sort({ stock: 1 });
  res.json({ success: true, data: products });
});

export const updateProduct = asyncHandler(async (req: Request<IdParams, IProduct, UpdateProductDto>, res: Response<IProduct>) => {
  const update = { ...req.body }; if (update.imageUrl) update.image = update.imageUrl; if (update.image) update.imageUrl = update.image;
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!product) throw new ApiError(404, "Product not found");
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req: Request<IdParams, ApiResponse<never>>, res: Response<ApiResponse<never>>) => {
  const product = await Product.findByIdAndDelete(req.params.id); if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, message: "Product deleted successfully" });
});
