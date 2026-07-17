import jwt from "jsonwebtoken";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import User from "../models/User";
import ApiError from "../utils/apiError";
import type { JwtPayload } from "../types";

export const protect: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization; const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw new ApiError(401, "Not authorized, no token");
    const secret = process.env.JWT_SECRET; if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");
    const decoded = jwt.verify(token, secret) as JwtPayload; const user = await User.findById(decoded.userId).select("+password");
    if (!user) throw new ApiError(401, "Not authorized, user not found"); req.user = user; next();
  } catch (error: unknown) { next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token")); }
};

export const adminOnly: RequestHandler = (req, _res, next): void => { if (req.user?.role !== "admin") return next(new ApiError(403, "Admin access only")); next(); };
