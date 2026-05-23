const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.json(users);
});

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json(user);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["name", "email", "role"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json(user);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw new ApiError(400, "At least one admin account is required");
    }
  }

  await user.deleteOne();

  res.json({ message: "User deleted successfully" });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
