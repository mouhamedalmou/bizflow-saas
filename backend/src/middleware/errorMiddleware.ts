import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import ApiError from "../utils/apiError";

export const notFound: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next): void => {
  let statusCode = 500; let message = "Internal server error"; let errors: unknown[] = [];
  if (error instanceof ApiError) { statusCode = error.statusCode; message = error.message; errors = error.errors; }
  else if (error instanceof mongoose.Error.ValidationError) { statusCode = 400; message = "Validation failed"; errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message })); }
  else if (error instanceof mongoose.Error.CastError) { statusCode = 400; message = `Invalid ${error.path}`; }
  else if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) { statusCode = 401; message = "Invalid or expired token"; }
  else if (error instanceof multer.MulterError) { statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400; message = error.message; }
  else if (error instanceof Error) message = process.env.NODE_ENV === "production" ? message : error.message;
  const body: { success: false; message: string; errors?: unknown[]; stack?: string } = { success: false, message }; if (errors.length) body.errors = errors; if (process.env.NODE_ENV !== "production" && error instanceof Error) body.stack = error.stack;
  res.status(statusCode).json(body);
};
