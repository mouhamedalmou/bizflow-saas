const express = require("express");
const {
  getSubscriptionPlans,
  createSubscription,
  getMySubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
} = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  createSubscriptionValidation,
  updateSubscriptionStatusValidation,
} = require("../validations/subscriptionValidation");

const router = express.Router();

router.get("/plans", getSubscriptionPlans);
router.get("/my-subscription", protect, getMySubscription);

router
  .route("/")
  .post(protect, createSubscriptionValidation, validateMiddleware, createSubscription)
  .get(protect, adminOnly, getAllSubscriptions);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateSubscriptionStatusValidation,
  validateMiddleware,
  updateSubscriptionStatus
);

module.exports = router;
