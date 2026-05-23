const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();
const uploadRoutes = require("./routes/uploadRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");

const app = express();

connectDB();

const allowedOrigins = (process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests, please try again later",
  },
});

app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new ApiError(403, "Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/upload", uploadRoutes);
app.get("/", (req, res) => {
  res.send("BizFlow SaaS API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
