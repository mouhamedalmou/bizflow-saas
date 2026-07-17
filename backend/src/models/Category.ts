import { Schema, model } from "mongoose";
import type { ICategory } from "../types";

/** Product taxonomy entry referenced by inventory products. */
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: [true, "Category name is required"], unique: true, index: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  deletedAt: { type: Date, default: null, select: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

categorySchema.pre(["find", "findOne", "findOneAndUpdate"], function excludeDeleted() { this.where({ deletedAt: null }); });
export default model<ICategory>("Category", categorySchema);
