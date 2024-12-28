import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("subscription_id");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!subscriptionId) {
      return new NextResponse("Subscription ID required", { status: 400 });
    }

    // Get PayPal access token
    const tokenResponse = await fetch(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenResponse.json();

    // Verify subscription with PayPal
    const response = await fetch(`${process.env.PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const subscription = await response.json();

    if (!response.ok) {
      console.error("PayPal API Error:", subscription);
      return new NextResponse("PayPal API Error", { status: 500 });
    }

    // Create or update subscription in database
    const existingSubscription = await prismaEdge.userSubscription.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        paypalSubscriptionId: subscription.id,
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: subscription.billing_info.next_billing_time ? new Date(subscription.billing_info.next_billing_time) : null,
        paypalPayerId: subscription.subscriber.payer_id,
        paypalPlanId: subscription.plan_id,
      },
      update: {
        paypalSubscriptionId: subscription.id,
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: subscription.billing_info.next_billing_time ? new Date(subscription.billing_info.next_billing_time) : null,
        paypalPayerId: subscription.subscriber.payer_id,
        paypalPlanId: subscription.plan_id,
      },
    });

    return NextResponse.json({
      subscriptionId: existingSubscription.paypalSubscriptionId,
      status: existingSubscription.paypalStatus,
      currentPeriodEnd: existingSubscription.paypalCurrentPeriodEnd,
    });
  } catch (error) {
    console.error("[PAYPAL_VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
