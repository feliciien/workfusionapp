import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { db } from "@/lib/db";
import { paypalApi } from "@/lib/paypal";

export const runtime = 'edge';

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the subscription ID from the request body
    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    // Find the subscription in our database
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        paypalSubscriptionId: subscriptionId
      }
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    // Cancel the subscription with PayPal
    const response = await paypalApi.cancelSubscription(subscriptionId);

    if (!response.ok) {
      const error = await response.json();
      console.error("[PAYPAL_CANCEL_ERROR]", error);
      return new NextResponse("Failed to cancel subscription with PayPal", { status: 500 });
    }

    // Update subscription in database
    await db.subscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status: "CANCELLED",
        canceledAt: new Date()
      }
    });

    return new NextResponse("Subscription cancelled successfully");
  } catch (error) {
    console.error("[CANCEL_SUBSCRIPTION_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}