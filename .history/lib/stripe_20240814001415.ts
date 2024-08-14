// pages/api/stripe/route.ts

import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET(request: Request) {
  try {
    // Authenticate and get the current user
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find user subscription
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    // If the user has a Stripe customer ID, create a billing portal session
    if (userSubscription?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200 });
    }

    // Otherwise, create a checkout session for new subscriptions
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Prometheus Pro",
              description: "Prometheus Pro",
            },
            unit_amount: 2000, // Amount in cents ($20.00)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200 });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}