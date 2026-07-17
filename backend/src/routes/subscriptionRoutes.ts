import express from "express";
import {
  getSubscriptionPlans,
  createSubscription,
  getMySubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
} from "../controllers/subscriptionController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import validateMiddleware from "../middleware/validateMiddleware";
import {
  createSubscriptionValidation,
  updateSubscriptionStatusValidation,
} from "../validations/subscriptionValidation";

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

export default router;
