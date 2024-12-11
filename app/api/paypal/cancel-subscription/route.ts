import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs"; // Assuming you're using Clerk for authentication

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Dummy function to get and remove user's subscription ID
async function getAndRemoveUserSubscriptionId(userId: string): Promise<string | null> {
  // Implement your logic to retrieve and remove the subscription ID from the database
  return "P-XXXXXXXXXXXXXXXXXXXXXXXX"; // Replace with actual implementation
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = await getAndRemoveUserSubscriptionId(userId);

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
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

    // Cancel Subscription
    const cancelResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "User requested cancellation.",
      }),
    });

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      console.error("PayPal Subscription Cancellation Error:", errorText);
      return NextResponse.json({ error: "Failed to cancel subscription." }, { status: 500 });
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}