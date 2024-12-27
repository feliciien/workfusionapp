import { NextResponse } from "next/server";
import { prismaEdge } from "@/lib/prisma-edge";
import { headers } from "next/headers";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const webhookId = headersList.get("paypal-transmission-id");
    const eventType = headersList.get("paypal-event-type");

    console.log("[WEBHOOK] Received PayPal webhook:", {
      webhookId,
      eventType,
      timestamp: new Date().toISOString()
    });

    const body = await req.json();

    const {
      resource: {
        id: subscriptionId,
        status,
        subscriber: { payer_id },
        billing_info: { next_billing_time, cycle_executions },
        custom_id: userId // We pass userId as custom_id when creating subscription
      },
    } = body;

    // Find the user with this PayPal subscription
    let existingSubscription = await prismaEdge.userSubscription.findUnique({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
    });

    // If not found by subscription ID, try finding by userId
    if (!existingSubscription && userId) {
      existingSubscription = await prismaEdge.userSubscription.findUnique({
        where: {
          userId: userId,
        },
      });
    }

    // If still not found and we have a userId, create a new subscription
    if (!existingSubscription && userId) {
      existingSubscription = await prismaEdge.userSubscription.create({
        data: {
          userId: userId,
          paypalSubscriptionId: subscriptionId,
          paypalStatus: status,
          paypalCurrentPeriodEnd: next_billing_time ? new Date(next_billing_time) : null,
          paypalPayerId: payer_id,
        },
      });

      console.log("[WEBHOOK] Created new subscription:", {
        subscriptionId,
        userId,
        status,
        timestamp: new Date().toISOString()
      });

      return new NextResponse(null, { status: 200 });
    }

    if (!existingSubscription) {
      console.log("[WEBHOOK] No subscription found for:", {
        subscriptionId,
        userId,
        status,
        timestamp: new Date().toISOString()
      });
      return new NextResponse(null, { status: 200 });
    }

    console.log("[WEBHOOK] Processing subscription update:", {
      subscriptionId,
      userId: existingSubscription.userId,
      oldStatus: existingSubscription.paypalStatus,
      newStatus: status,
      timestamp: new Date().toISOString()
    });

    // Update the subscription status
    await prismaEdge.userSubscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        paypalStatus: status,
        paypalCurrentPeriodEnd: next_billing_time ? new Date(next_billing_time) : null,
        paypalPayerId: payer_id,
        paypalSubscriptionId: subscriptionId,
      },
    });

    console.log("[WEBHOOK] Successfully updated subscription:", {
      subscriptionId,
      userId: existingSubscription.userId,
      status,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error", { status: 500 });
  }
}

// Route segment config
export const dynamic = 'force-dynamic';