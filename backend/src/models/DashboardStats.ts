import { Schema, model } from "mongoose";
import type { IDashboardStats } from "../types";

/** Materialized dashboard metrics cache; application services refresh this document. */
const dashboardStatsSchema = new Schema<IDashboardStats>({
  totalRevenue: { type: Number, min: 0, default: 0 },
  totalOrders: { type: Number, min: 0, default: 0 },
  activeOrders: { type: Number, min: 0, default: 0 },
  lowStockProducts: { type: Number, min: 0, default: 0 },
}, { timestamps: { createdAt: false, updatedAt: true }, versionKey: false });

dashboardStatsSchema.index({ updatedAt: -1 });
export default model<IDashboardStats>("DashboardStats", dashboardStatsSchema);
