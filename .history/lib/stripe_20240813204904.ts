import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_API_KEY;

if (!stripeApiKey) {
  throw new Error("Stripe API key is not defined in environment variables");
}

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2022-11-15",
});