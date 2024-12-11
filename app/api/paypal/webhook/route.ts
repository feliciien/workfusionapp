import { NextResponse } from "next/server";
import { buffer } from "micro";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;

// Dummy function to update user subscription status
async function updateUserSubscription(subscriptionId: string, isPro: boolean) {
  // Implement your logic to update the user's subscription status in your database
  // Example using Prisma:
  // await prisma.user.update({
  //   where: { subscriptionId },
  //   data: { isPro },
  // });
}

export async function POST(req: Request) {
  const reqBuffer = await buffer(req);
  const signature = req.headers.get("paypal-auth-algo");
  const transmissionId = req.headers.get("paypal-transmission-id");
  const timestamp = req.headers.get("paypal-transmission-time");
  const webhookEventBody = reqBuffer.toString();
  const webhookEvent = JSON.parse(webhookEventBody);
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
    console.error("Webhook signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Handle different event types
  const eventType = webhookEvent.event_type;
  const resource = webhookEvent.resource;

  switch (eventType) {
    case "BILLING.SUBSCRIPTION.CREATED":
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      const subscriptionId = resource.id;
      await updateUserSubscription(subscriptionId, true);
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      const cancelledSubscriptionId = resource.id;
      await updateUserSubscription(cancelledSubscriptionId, false);
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ status: "success" }, { status: 200 });
}

// To allow body parsing as buffer
export const config = {
  api: {
    bodyParser: false,
  },
};