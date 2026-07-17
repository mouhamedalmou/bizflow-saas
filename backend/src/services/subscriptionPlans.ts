const plans = [
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

const getPlans = () => plans;

const getPlanByCode = (code: string) => {
  return plans.find((plan) => plan.code === String(code).toLowerCase());
};

module.exports = {
  getPlans,
  getPlanByCode,
};
