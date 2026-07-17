import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import type { IUser } from "../types";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["admin", "customer"], default: "customer", index: true },
  avatar: { type: String, default: "" },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.pre("save", async function hashPassword(): Promise<void> {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export default model<IUser>("User", userSchema);
