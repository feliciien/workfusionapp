import { auth as clerkAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = clerkAuth();
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("subscription_id");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!subscriptionId) {
      return new NextResponse("Subscription ID required", { status: 400 });
    }

    // Basic auth token
    const basicAuth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    // Get subscription details from PayPal
    const response = await fetch(
      `${process.env.PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    if (!response.ok) {
      console.error("PayPal API Error:", await response.text());
      return new NextResponse("PayPal API Error", { status: 500 });
    }

    const subscription = await response.json();

    // Update subscription in database using regular Prisma client
    const userSubscription = await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        paypalSubscriptionId: subscription.id,
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: subscription.billing_info.next_billing_time
          ? new Date(subscription.billing_info.next_billing_time)
          : null,
        paypalCustomerId: subscription.subscriber.payer_id,
        paypalPlanId: subscription.plan_id
      },
      update: {
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: subscription.billing_info.next_billing_time
          ? new Date(subscription.billing_info.next_billing_time)
          : null,
        paypalCustomerId: subscription.subscriber.payer_id,
        paypalPlanId: subscription.plan_id
      },
    });

    return NextResponse.json(userSubscription);
  } catch (error) {
    console.error("[PAYPAL_VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
