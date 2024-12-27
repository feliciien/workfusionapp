import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/db";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("[PAYPAL_AUTH_ERROR] Failed to get access token:", error);
    throw error;
  }
}

async function getSubscriptionDetails(subscriptionId: string, accessToken: string) {
  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[PAYPAL_SUBSCRIPTION_ERROR] Failed to get subscription details:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("[VERIFY_ERROR] Unauthorized - No user found:", { userId });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      console.error("[VERIFY_ERROR] No subscription ID provided");
      return new NextResponse("Subscription ID is required", { status: 400 });
    }

    console.log(`[VERIFY] Verifying subscription ${subscriptionId} for user ${userId}`);

    // Get subscription details from PayPal
    const accessToken = await getPayPalAccessToken();
    const subscription = await getSubscriptionDetails(subscriptionId, accessToken);

    if (!subscription) {
      console.error("[VERIFY_ERROR] No subscription found in PayPal");
      return new NextResponse("Subscription not found", { status: 404 });
    }

    console.log('[VERIFY] PayPal subscription details:', {
      id: subscription.id,
      status: subscription.status,
      plan_id: subscription.plan_id,
      next_billing_time: subscription.billing_info.next_billing_time,
      timestamp: new Date().toISOString()
    });

    // Create or update user first
    await db.user.upsert({
      where: {
        id: userId,
      },
      create: {
        id: userId,
      },
      update: {},
    });

    // Update or create subscription in our database
    const userSubscription = await db.userSubscription.upsert({
      where: {
        userId: userId
      },
      create: {
        userId: userId,
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: subscription.plan_id,
        paypalStatus: subscription.status.toUpperCase(),
        paypalCurrentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      },
      update: {
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: subscription.plan_id,
        paypalStatus: subscription.status.toUpperCase(),
        paypalCurrentPeriodEnd: new Date(subscription.billing_info.next_billing_time),
      },
    });

    console.log('[VERIFY] Subscription updated in database:', {
      userId,
      subscriptionId,
      status: userSubscription.paypalStatus,
      currentPeriodEnd: userSubscription.paypalCurrentPeriodEnd,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(JSON.stringify(userSubscription), { status: 200 });
  } catch (error: any) {
    console.error("[VERIFY_ERROR] Failed to verify subscription:", {
      error: error?.response?.data || error,
      timeElapsed: Date.now() - start,
      timestamp: new Date().toISOString()
    });
    return new NextResponse(error?.response?.data?.message || "Internal Server Error", { 
      status: error?.response?.status || 500 
    });
  }
}
