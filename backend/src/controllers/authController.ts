import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import sendEmail from "../utils/sendEmail";
import type { ApiResponse, JwtPayload, LoginDto, RegisterDto, TokenParams, IUser } from "../types";

const jwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");
  return secret;
};
const generateToken = (userId: string): string => jwt.sign({ userId } satisfies JwtPayload, jwtSecret(), { expiresIn: "30d" });
const publicUser = (user: IUser) => ({ id: user.id, _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, createdAt: user.createdAt });

export const registerUser = asyncHandler(async (req: Request<Record<string, never>, ApiResponse<never>, RegisterDto>, res: Response<ApiResponse<never>>) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new ApiError(409, "User already exists");
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await User.create({ name, email, password, role: "customer", emailVerificationToken: verificationToken, emailVerificationExpires: new Date(Date.now() + 86_400_000) });
  const frontendUrl = process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? "http://localhost:5173";
  try {
    await sendEmail({ to: user.email, subject: "Verify your BizFlow account", html: `<h2>Welcome to BizFlow</h2><p>Verify your email:</p><a href="${frontendUrl}/verify-email/${verificationToken}">Verify account</a>` });
  } catch (error: unknown) {
    await User.findByIdAndDelete(user._id);
    throw error instanceof ApiError ? error : new ApiError(502, "Unable to send verification email");
  }
  res.status(201).json({ success: true, message: "User registered. Please verify your email." });
});

export const loginUser = asyncHandler(async (req: Request<Record<string, never>, unknown, LoginDto>, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid email or password");
  res.json({ ...publicUser(user), token: generateToken(user.id) });
});

export const logoutUser = asyncHandler(async (_req: Request, res: Response<ApiResponse<never>>) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  res.json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  res.json(publicUser(req.user));
});

export const verifyEmail = asyncHandler(async (req: Request<TokenParams>, res: Response<ApiResponse<never>>) => {
  const user = await User.findOne({ emailVerificationToken: req.params.token, emailVerificationExpires: { $gt: new Date() } }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw new ApiError(400, "Invalid or expired verification token");
  user.isEmailVerified = true; user.emailVerificationToken = undefined; user.emailVerificationExpires = undefined; await user.save();
  res.json({ success: true, message: "Email verified successfully" });
});

export const forgotPassword = asyncHandler(async (req: Request<Record<string, never>, ApiResponse<never>, { email: string }>, res: Response<ApiResponse<never>>) => {
  const user = await User.findOne({ email: req.body.email }).select("+passwordResetToken +passwordResetExpires");
  if (user) {
    const token = crypto.randomBytes(32).toString("hex"); user.passwordResetToken = token; user.passwordResetExpires = new Date(Date.now() + 900_000); await user.save();
    const url = `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/reset-password/${token}`;
    try { await sendEmail({ to: user.email, subject: "Reset your BizFlow password", html: `<p>Reset your password:</p><a href="${url}">${url}</a>` }); }
    catch { user.passwordResetToken = undefined; user.passwordResetExpires = undefined; await user.save(); throw new ApiError(502, "Unable to send reset email"); }
  }
  res.json({ success: true, message: "If this email exists, a reset link has been sent" });
});

export const resetPassword = asyncHandler(async (req: Request<TokenParams, ApiResponse<never>, { password: string }>, res: Response<ApiResponse<never>>) => {
  const user = await User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: new Date() } }).select("+password +passwordResetToken +passwordResetExpires");
  if (!user) throw new ApiError(400, "Invalid or expired reset token");
  user.password = req.body.password; user.passwordResetToken = undefined; user.passwordResetExpires = undefined; await user.save();
  res.json({ success: true, message: "Password reset successfully" });
});
