const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validateMiddleware = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  next(new ApiError(400, "Validation failed", errors));
};

module.exports = validateMiddleware;
