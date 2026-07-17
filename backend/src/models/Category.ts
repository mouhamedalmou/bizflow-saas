import { Schema, model } from "mongoose";
import type { ICategory } from "../types";

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true, index: true },
  description: { type: String, default: "", trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

export default model<ICategory>("Category", categorySchema);
