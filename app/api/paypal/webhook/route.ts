import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;

async function handleSubscriptionActivated(event: any) {
  const subscriptionId = event.resource.id;
  const planId = event.resource.plan_id;
  const userId = event.resource.custom_id; // We'll pass the userId as custom_id when creating subscription

  try {
    await prisma.userSubscription.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: planId,
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: new Date(event.resource.billing_info.next_billing_time),
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: planId,
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: new Date(event.resource.billing_info.next_billing_time),
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

async function handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.resource.id;

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
    });

    if (!subscription) {
      console.log("No subscription found for ID:", subscriptionId);
      return;
    }

    await prisma.userSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        paypalStatus: 'CANCELLED',
      },
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

async function handleSubscriptionExpired(event: any) {
  const subscriptionId = event.resource.id;

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        paypalSubscriptionId: subscriptionId,
      },
    });

    if (!subscription) {
      console.log("No subscription found for ID:", subscriptionId);
      return;
    }

    await prisma.userSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        paypalStatus: 'EXPIRED',
      },
    });
  } catch (error) {
    console.error("Error updating expired subscription:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paypal-auth-algo");
    const transmissionId = req.headers.get("paypal-transmission-id");
    const timestamp = req.headers.get("paypal-transmission-time");
    const webhookEvent = JSON.parse(rawBody);
    const webhookId = PAYPAL_WEBHOOK_ID;
    const authAlgo = req.headers.get("paypal-auth-algo");
    const certUrl = req.headers.get("paypal-cert-url");
    const transmissionSig = req.headers.get("paypal-transmission-sig");

    // Verify the webhook signature
    const verifyResponse = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: timestamp,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.verification_status !== "SUCCESS") {
      console.error("Failed to verify webhook signature");
      return new NextResponse("Webhook signature verification failed", { status: 400 });
    }

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(webhookEvent);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(webhookEvent);
        break;
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await handleSubscriptionExpired(webhookEvent);
        break;
      default:
        console.log("Unhandled webhook event type:", webhookEvent.event_type);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

// Route segment config
export const dynamic = 'force-dynamic';