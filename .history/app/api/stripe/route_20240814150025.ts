// pages/api/stripe/route.ts

import { auth, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// Ensure that your settings URL is correct
const settingsUrl = absoluteUrl("/settings");

export async function GET(request: NextRequest) {
  try {
    // Retrieve the authenticated user ID and user details
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the user's subscription details from the database
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    if (userSubscription?.stripeCustomerId) {
      // If the user has a Stripe customer ID, create a billing portal session
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200 });
    }

    // If the user does not have a Stripe customer ID, create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0]?.emailAddress || "", // Use default empty string if email is undefined
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "SynthAI Pro",
              description: "SynthAI Pro Subscription",
            },
            unit_amount: 2000,
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