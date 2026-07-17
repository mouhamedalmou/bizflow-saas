import { Schema, model } from "mongoose";
import type { IOrder, IOrderItem } from "../types";

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  orderItems: { type: [orderItemSchema], required: true },
  totalPrice: { type: Number, required: true, default: 0, min: 0 },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "completed", "cancelled"], default: "pending", index: true },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.pre("validate", function syncAliases(): void {
  if (this.items.length && !this.orderItems.length) this.orderItems = this.items;
  if (this.orderItems.length && !this.items.length) this.items = this.orderItems;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.user && !this.userId && !("email" in this.user)) this.userId = this.user;
});

export default model<IOrder>("Order", orderSchema);
