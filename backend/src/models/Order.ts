import { Schema, model } from "mongoose";
import ApiError from "../utils/apiError";
import type { IOrder, IOrderItem, OrderStatus, OrderTimeline } from "../types";

const itemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, default: "" }, quantity: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: "Quantity must be an integer" } },
  priceAtTime: { type: Number, required: true, min: 0 }, price: { type: Number, required: true, min: 0 },
}, { _id: false });
const addressSchema = new Schema({ street: { type: String, required: true, trim: true }, city: { type: String, required: true, trim: true }, zip: { type: String, required: true, trim: true }, country: { type: String, required: true, trim: true } }, { _id: false });

/** Customer order with immutable price snapshots and workflow helpers. */
const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [itemSchema], required: true, validate: { validator: (items: IOrderItem[]) => items.length > 0, message: "Order requires at least one item" } }, orderItems: { type: [itemSchema], required: true },
  totalPrice: { type: Number, required: true, min: 0 }, status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending", index: true },
  shippingAddress: { type: addressSchema, required: true }, notes: { type: String, trim: true, maxlength: 1000 }, paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  deletedAt: { type: Date, default: null, select: false },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

/** Recalculates the order total from the captured unit prices. */
orderSchema.methods.calculateTotal = function calculateTotal(): number { return this.items.reduce((total: number, item: IOrderItem) => total + item.quantity * item.priceAtTime, 0); };
/** Applies a valid forward workflow transition and persists it. */
orderSchema.methods.updateStatus = async function updateStatus(this: IOrder, newStatus: OrderStatus): Promise<void> { const transitions: Record<OrderStatus, OrderStatus[]> = { pending: ["processing", "cancelled"], processing: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [] }; if (!transitions[this.status].includes(newStatus)) throw new ApiError(409, `Invalid transition from ${this.status} to ${newStatus}`); this.status = newStatus; await this.save(); };
/** Returns workflow progress suitable for an order timeline UI. */
orderSchema.methods.getOrderTimeline = function getOrderTimeline(): OrderTimeline { const flow: OrderStatus[] = ["pending", "processing", "shipped", "delivered"]; const currentStep = this.status === "cancelled" ? -1 : flow.indexOf(this.status); return { status: this.status, completed: currentStep < 0 ? [] : flow.slice(0, currentStep + 1), currentStep, updatedAt: this.updatedAt }; };
orderSchema.pre("validate", function normalizeOrder(): void { this.items ??= []; this.orderItems ??= []; if (this.items.length && !this.orderItems.length) this.orderItems = this.items; if (this.orderItems.length && !this.items.length) this.items = this.orderItems; for (const item of this.items) { item.product ||= item.productId; item.productId ||= item.product; item.priceAtTime ??= item.price; item.price ??= item.priceAtTime; } this.totalPrice = this.calculateTotal(); if (this.userId && !this.user) this.user = this.userId; });
orderSchema.pre(["find", "findOne", "findOneAndUpdate"], function populateReferences() { this.where({ deletedAt: null }).populate("userId", "name email avatar").populate("items.productId", "name sku imageUrl"); });
orderSchema.index({ userId: 1, createdAt: -1 });

export default model<IOrder>("Order", orderSchema);
