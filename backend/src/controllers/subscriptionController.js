const Subscription = require("../models/Subscription");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const {
  getPlans,
  getPlanByCode,
} = require("../services/subscriptionPlans");

const getPeriodEnd = (interval) => {
  const endDate = new Date();

  if (interval === "year") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return endDate;
};

// @desc    Get available plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  res.json(getPlans());
});

// @desc    Create or update user subscription
// @route   POST /api/subscriptions
// @access  Customer/Admin
const createSubscription = asyncHandler(async (req, res) => {
  const plan = getPlanByCode(req.body.planCode);

  if (!plan) {
    throw new ApiError(404, "Subscription plan not found");
  }

  const payload = {
    user: req.user._id,
    planCode: plan.code,
    planName: plan.name,
    price: plan.price,
    interval: plan.interval,
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: getPeriodEnd(plan.interval),
  };

  let subscription = await Subscription.findOne({ user: req.user._id });
  const statusCode = subscription ? 200 : 201;

  if (subscription) {
    Object.assign(subscription, payload);
    subscription = await subscription.save();
  } else {
    subscription = await Subscription.create(payload);
  }

  res.status(statusCode).json(subscription);
});

// @desc    Get logged user subscription
// @route   GET /api/subscriptions/my-subscription
// @access  Customer/Admin
const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
  }).populate("user", "name email role");

  res.json(subscription);
});

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Admin
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(subscriptions);
});

// @desc    Update subscription status
// @route   PUT /api/subscriptions/:id/status
// @access  Admin
const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  subscription.status = req.body.status;

  if (["cancelled", "expired"].includes(req.body.status)) {
    subscription.currentPeriodEnd = new Date();
  }

  const updatedSubscription = await subscription.save();

  res.json(updatedSubscription);
});

module.exports = {
  getSubscriptionPlans,
  createSubscription,
  getMySubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
};
