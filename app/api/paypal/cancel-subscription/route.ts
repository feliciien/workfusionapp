import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { createNeonClient } from "@/lib/db";
import { cancelSubscription } from "@/lib/paypal";

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

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    const db = createNeonClient();

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        paypalSubscriptionId: subscriptionId,
        status: "ACTIVE"
      }
    });

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    const response = await cancelSubscription(subscriptionId);

    if (!response.ok) {
      return new NextResponse("Failed to cancel subscription with PayPal", { status: 500 });
    }

    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" }
    });

    return new NextResponse("Subscription cancelled", { status: 200 });
  } catch (error) {
    console.error("[CANCEL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}