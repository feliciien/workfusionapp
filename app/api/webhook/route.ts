import { headers } from "next/headers";
import axios from "axios";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// PayPal live configurations
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

interface PayPalError {
  response?: {
    data?: any;
  };
  message?: string;
}

// Function to verify PayPal webhook event
async function verifyPayPalWebhook(eventBody: any, headers: Headers): Promise<boolean> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const webhookHeaders = {
      "auth_algo": headers.get("paypal-auth-algo"),
      "cert_url": headers.get("paypal-cert-url"),
      "transmission_id": headers.get("paypal-transmission-id"),
      "transmission_sig": headers.get("paypal-transmission-sig"),
      "transmission_time": headers.get("paypal-transmission-time"),
    };

    // Log webhook verification attempt
    console.log('[WEBHOOK] Verifying webhook:', {
      headers: webhookHeaders,
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: webhookHeaders.auth_algo,
        cert_url: webhookHeaders.cert_url,
        transmission_id: webhookHeaders.transmission_id,
        transmission_sig: webhookHeaders.transmission_sig,
        transmission_time: webhookHeaders.transmission_time,
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

    const isVerified = response.data.verification_status === "SUCCESS";
    console.log('[WEBHOOK] Verification result:', {
      isVerified,
      status: response.data.verification_status,
      timestamp: new Date().toISOString()
    });

    return isVerified;
  } catch (error) {
    console.error('[WEBHOOK_ERROR] Verification failed:', {
      error,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Function to get subscription details from PayPal
async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('[WEBHOOK] Subscription details:', {
      subscriptionId,
      details: response.data,
      timestamp: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('[WEBHOOK_ERROR] Failed to get subscription details:', {
      subscriptionId,
      error,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const headersList = headers();
    const body = await req.json();

    console.log('[WEBHOOK] Received webhook:', {
      eventType: body.event_type,
      resourceType: body.resource_type,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature
    const isVerified = await verifyPayPalWebhook(
      body, 
      await headersList
    );
    if (!isVerified) {
      console.error('[WEBHOOK_ERROR] Invalid webhook signature');
      return new NextResponse("Invalid webhook signature", { status: 400 });
    }

    // Handle different webhook events
    const eventType = body.event_type;
    const resource = body.resource;

    if (eventType.startsWith('BILLING.SUBSCRIPTION')) {
      const subscriptionId = resource.id;
      const userId = resource.custom_id;

      if (!userId || !subscriptionId) {
        console.error('[WEBHOOK_ERROR] Missing user or subscription ID:', {
          userId,
          subscriptionId,
          timestamp: new Date().toISOString()
        });
        return new NextResponse("Missing user or subscription ID", { status: 400 });
      }

      // Get full subscription details
      const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
      const status = subscriptionDetails.status.toUpperCase();
      const currentPeriodEnd = new Date(subscriptionDetails.billing_info.next_billing_time || subscriptionDetails.billing_info.last_payment.time);

      console.log('[WEBHOOK] Processing subscription update:', {
        userId,
        subscriptionId,
        status,
        currentPeriodEnd,
        timestamp: new Date().toISOString()
      });

      // Update subscription in database
      await db.userSubscription.upsert({
        where: {
          userId: userId
        },
        create: {
          userId: userId,
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: subscriptionDetails.plan_id,
          paypalStatus: status,
          paypalCurrentPeriodEnd: currentPeriodEnd,
        },
        update: {
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: subscriptionDetails.plan_id,
          paypalStatus: status,
          paypalCurrentPeriodEnd: currentPeriodEnd,
        },
      });

      console.log('[WEBHOOK] Subscription updated:', {
        userId,
        subscriptionId,
        status,
        currentPeriodEnd,
        timeElapsed: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK_ERROR] Failed to process webhook:', {
      error,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}