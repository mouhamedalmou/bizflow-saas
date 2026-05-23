const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    planCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    planName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    interval: {
      type: String,
      enum: ["month", "year"],
      default: "month",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "past_due", "expired"],
      default: "active",
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
