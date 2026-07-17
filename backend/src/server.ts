import "dotenv/config";
import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import ApiError from "./utils/apiError";
import { errorHandler, notFound } from "./middleware/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import userRoutes from "./routes/userRoutes";

const origins = [process.env.ALLOWED_ORIGINS, process.env.CLIENT_URL, process.env.FRONTEND_URL, "https://bizflowsaas.duckdns.org", "http://localhost:5173", "http://localhost:3000"].filter((value): value is string => Boolean(value)).flatMap((value) => value.split(",")).map((value) => value.trim());
const corsOptions: CorsOptions = { credentials: true, origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new ApiError(403, "Not allowed by CORS")); } };

export const createApp = (): Express => {
  const app = express(); app.disable("x-powered-by"); app.use(helmet()); app.use(cors(corsOptions)); app.use(express.json({ limit: "1mb" })); app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
  const authLimiter = rateLimit({ windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 900_000, limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20, standardHeaders: "draft-8", legacyHeaders: false });
  app.use("/api/auth", authLimiter, authRoutes); app.use("/api/products", productRoutes); app.use("/api/orders", orderRoutes); app.use("/api/dashboard", dashboardRoutes); app.use("/api/users", userRoutes); app.use("/api/upload", uploadRoutes);
  app.get("/api", (_req, res) => res.json({ success: true, message: "BizFlow SaaS API running" })); app.use(notFound); app.use(errorHandler); return app;
};

export const app = createApp();
if (process.env.NODE_ENV !== "test") { const port = Number(process.env.PORT) || 5000; connectDB().then(() => app.listen(port, () => console.log(`Server running on port http://localhost:${port}`))).catch((error: unknown) => { console.error("Startup failed", error); process.exit(1); }); }
