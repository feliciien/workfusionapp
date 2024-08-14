import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    // Get the authenticated user's ID and information
    const { userId } = auth();
    const user = await currentUser();

    // Check if the user is authenticated
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Retrieve the user's subscription from the database
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // If the user has a subscription, create a Stripe billing portal session
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If the user does not have a subscription, create a Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0]?.emailAddress || "",
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Prometheus Pro",
              description: "Prometheus Pro",
            },
            unit_amount: 2000, // Amount in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}