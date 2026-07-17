import { Schema, model } from "mongoose";
import type { IProduct } from "../types";

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true, index: "text" },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0, index: true },
  category: { type: String, required: true, trim: true, index: true },
  imageUrl: { type: String, default: "" },
  image: { type: String, default: "" },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.pre("validate", function syncImageFields(): void {
  if (this.imageUrl && !this.image) this.image = this.imageUrl;
  if (this.image && !this.imageUrl) this.imageUrl = this.image;
  if (!this.sku) this.sku = `BF-${Date.now().toString(36).toUpperCase()}`;
});

export default model<IProduct>("Product", productSchema);
