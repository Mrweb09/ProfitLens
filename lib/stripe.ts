import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    auditsPerMonth: 1,
    priceId: null,
  },
  STARTER: {
    name: "Starter",
    price: 49,
    auditsPerMonth: 10,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  GROWTH: {
    name: "Growth",
    price: 99,
    auditsPerMonth: 50,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
  },
  AGENCY: {
    name: "Agency",
    price: 199,
    auditsPerMonth: -1, // unlimited
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
  },
};
