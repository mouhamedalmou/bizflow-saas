const ApiError = require("../utils/apiError");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors || [];

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value";
    errors = Object.keys(err.keyValue || {}).map((field) => ({
      field,
      message: `${field} already exists`,
    }));
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
