import { headers } from "next/headers";
import axios from "axios";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

// PayPal live configurations
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_API_BASE = "https://api-m.paypal.com"; // Live API base URL
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Function to verify PayPal webhook event
async function verifyPayPalWebhook(eventBody: any, signature: string): Promise<boolean> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: signature,
        cert_url: headers().get("paypal-cert-url"),
        transmission_id: headers().get("paypal-transmission-id"),
        transmission_sig: headers().get("paypal-transmission-sig"),
        transmission_time: headers().get("paypal-transmission-time"),
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: eventBody,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_VERIFICATION_ERROR]", error);
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("paypal-transmission-sig") as string;

  let event: any;

  try {
    event = JSON.parse(body);
  } catch (error) {
    return new NextResponse("Webhook Error: Invalid JSON", { status: 400 });
  }

  // Verify PayPal webhook signature
  const isVerified = await verifyPayPalWebhook(event, signature);
  if (!isVerified) {
    return new NextResponse("Webhook Verification Failed", { status: 400 });
  }

  // Handle different types of events
  const eventType = event.event_type;

  if (eventType === "BILLING.SUBSCRIPTION.CREATED") {
    const subscription = event.resource;

    if (!subscription.custom_id) {
      return new NextResponse("Unauthorized: User ID missing", { status: 401 });
    }

    // Create a user subscription in the database
    await prismadb.userSubscription.create({
      data: {
        userId: subscription.custom_id,
        paypalSubscriptionId: subscription.id,
        paypalPlanId: subscription.plan_id,
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      },
    });
  }

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "BILLING.SUBSCRIPTION.UPDATED") {
    const subscription = event.resource;

    // Update the subscription details in the database
    await prismadb.userSubscription.update({
      where: {
        paypalSubscriptionId: subscription.id,
      },
      data: {
        paypalPlanId: subscription.plan_id,
        paypalStatus: subscription.status,
        paypalCurrentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      },
    });
  }

  if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
    const subscription = event.resource;

    // Mark the subscription as canceled in the database
    await prismadb.userSubscription.update({
      where: {
        paypalSubscriptionId: subscription.id,
      },
      data: {
        paypalStatus: "CANCELLED",
      },
    });
  }

  return new NextResponse("OK", { status: 200 });
}