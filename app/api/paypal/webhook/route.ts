import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifySubscription } from "@/lib/paypal";
import { createNeonClient } from "@/lib/db";

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const transmissionId = headersList.get("paypal-transmission-id");
    const timestamp = headersList.get("paypal-transmission-time");
    const webhookId = headersList.get("paypal-webhook-id");
    const eventType = headersList.get("paypal-resource-type");

    if (!transmissionId || !timestamp || !webhookId || webhookId !== WEBHOOK_ID) {
      return new NextResponse("Invalid webhook signature", { status: 400 });
    }

    const body = await req.json();
    const { resource } = body;
    const subscriptionId = resource?.id;

    if (!subscriptionId) {
      return new NextResponse("No subscription ID found", { status: 400 });
    }

    const db = createNeonClient();

    // Verify subscription status with PayPal
    const { isValid, status } = await verifySubscription(subscriptionId);

    if (!isValid) {
      await db.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: "CANCELLED" }
      });
      return new NextResponse("Subscription is not valid", { status: 200 });
    }

    // Update subscription status in database
    await db.subscription.updateMany({
      where: { paypalSubscriptionId: subscriptionId },
      data: { status: status || "ACTIVE" }
    });

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Route segment config
export const dynamic = 'force-dynamic';