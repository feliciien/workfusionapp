// app/api/paypal/get-subscription/route.ts

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Dummy function to get user's subscription ID
async function getUserSubscriptionId(userId: string): Promise<string | null> {
  // Implement your logic to retrieve the subscription ID from the database
  return "P-XXXXXXXXXXXXXXXXXXXXXXXX"; // Replace with actual implementation
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!PAYPAL_API_BASE || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new NextResponse("PayPal configuration error", { status: 500 });
    }

    const subscriptionId = await getUserSubscriptionId(userId);

    if (!subscriptionId) {
      return NextResponse.json({ subscription: null }, { status: 200 });
    }

    // Create Access Token
    const authHeader = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal Auth Error:", errorText);
      return NextResponse.json({ error: "Failed to fetch PayPal access token." }, { status: 500 });
    }

    const { access_token } = await authResponse.json();

    // Get subscription details
    const subscriptionResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal Subscription Retrieval Error:", errorText);
      return NextResponse.json({ error: "Failed to retrieve subscription details." }, { status: 500 });
    }

    const subscriptionData = await subscriptionResponse.json();

    return NextResponse.json({ subscription: subscriptionData }, { status: 200 });
  } catch (error) {
    console.error("Get Subscription Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
