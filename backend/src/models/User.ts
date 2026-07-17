import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import type { IUser } from "../types";

/** Persistent BizFlow user with authentication helper methods. */
const userSchema = new Schema<IUser>({
  email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, maxlength: 254, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"] },
  password: { type: String, required: [true, "Password is required"], minlength: 6, maxlength: 128, select: false },
  name: { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 30 },
  avatar: { type: String, trim: true, maxlength: 2048, match: [/^https?:\/\//i, "Avatar must be a valid URL"] },
  role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false }, emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false }, passwordResetExpires: { type: Date, select: false },
  deletedAt: { type: Date, default: null, select: false },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true, transform: (_doc, value) => { const safe = value as unknown as Record<string, unknown>; delete safe.password; delete safe.passwordResetToken; return safe; } }, toObject: { virtuals: true } });

/** Hashes a changed password exactly once before persistence. */
userSchema.pre("save", async function hashPassword(): Promise<void> { if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12); });
/** Compares a plain-text candidate against the stored bcrypt digest. */
userSchema.methods.comparePassword = function comparePassword(password: string): Promise<boolean> { return bcrypt.compare(password, this.password); };
/** Generates a reset token and stores only its SHA-256 digest for 15 minutes. */
userSchema.methods.generatePasswordReset = function generatePasswordReset(): string { const token = crypto.randomBytes(32).toString("hex"); this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex"); this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); return token; };
userSchema.index({ email: 1 }, { unique: true });
userSchema.pre(["find", "findOne", "findOneAndUpdate"], function excludeDeleted() { this.where({ deletedAt: null }); });

export default model<IUser>("User", userSchema);
