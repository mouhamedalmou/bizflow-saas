interface SubscriptionPlan {
  code: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
}

const plans: SubscriptionPlan[] = [
  {
    code: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: ["Basic dashboard", "Products", "Orders"],
  },
  {
    code: "growth",
    name: "Growth",
    price: 79,
    interval: "month",
    features: ["Advanced dashboard", "Invoices", "Subscriptions"],
  },
  {
    code: "business",
    name: "Business",
    price: 199,
    interval: "month",
    features: ["Admin users", "Priority support", "Full SaaS toolkit"],
  },
];

export const getPlans = () => plans;

export const getPlanByCode = (code: string) => {
  return plans.find((plan) => plan.code === String(code).toLowerCase());
};
