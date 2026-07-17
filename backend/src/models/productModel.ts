import { Schema, model } from "mongoose";
import ApiError from "../utils/apiError";
import type { IProduct } from "../types";

/** Inventory product stored with immutable ownership and S3 image metadata. */
const productSchema = new Schema<IProduct>({
  name: { type: String, required: [true, "Product name is required"], unique: true, trim: true, minlength: 2, maxlength: 160 },
  description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 5000 },
  price: { type: Number, required: true, min: [0, "Price cannot be negative"], max: [10_000_000, "Price exceeds the supported maximum"] },
  stock: { type: Number, required: true, min: [0, "Stock cannot be negative"], max: [10_000_000, "Stock exceeds the supported maximum"], validate: { validator: Number.isInteger, message: "Stock must be an integer" } },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  imageUrl: { type: String, required: [true, "S3 image URL is required"], trim: true, maxlength: 2048, match: [/^https:\/\/.+\.s3[.-].+amazonaws\.com\//i, "imageUrl must be an AWS S3 URL"] },
  image: { type: String, default: "" },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 2, maxlength: 80 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  deletedAt: { type: Date, default: null, select: false },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

/** Decreases stock while preventing inventory from becoming negative. */
productSchema.methods.decreaseStock = async function decreaseStock(quantity: number): Promise<void> { if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, "Quantity must be a positive integer"); if (this.stock < quantity) throw new ApiError(409, "Insufficient stock"); this.stock -= quantity; await this.save(); };
/** Restocks a product by a positive integer quantity. */
productSchema.methods.increaseStock = async function increaseStock(quantity: number): Promise<void> { if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, "Quantity must be a positive integer"); this.stock += quantity; await this.save(); };
/** Reports whether stock is below the operational threshold. */
productSchema.methods.isLowStock = function isLowStock(): boolean { return this.stock < 10; };
productSchema.pre("validate", function syncLegacyImage(): void { if (this.imageUrl) this.image = this.imageUrl; else if (this.image) this.imageUrl = this.image; });
productSchema.pre(["find", "findOne", "findOneAndUpdate"], function populateReferences() { this.where({ deletedAt: null }).populate("category", "name description").populate("createdBy", "name email"); });
productSchema.index({ name: 1 }, { unique: true }); productSchema.index({ category: 1, name: 1 }); productSchema.index({ sku: 1 }, { unique: true }); productSchema.index({ createdAt: -1 });

export default model<IProduct>("Product", productSchema);
