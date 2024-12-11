import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs"; // Assuming you're using Clerk for authentication

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Dummy functions - replace with your actual database logic
async function associateSubscriptionWithUser(userId: string, subscriptionId: string): Promise<void> {
  // Implement your logic to associate the subscription ID with the user in your database
  // Example using Prisma:
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { subscriptionId, isPro: true },
  // });
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required." }, { status: 400 });
    }

    // Obtain Access Token
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
    const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal Subscription Retrieval Error:", errorText);
      return NextResponse.json({ error: "Failed to retrieve subscription details." }, { status: 500 });
    }

    const subscriptionData = await subscriptionResponse.json();

    if (subscriptionData.status !== "ACTIVE") {
      return NextResponse.json({ error: "Subscription is not active." }, { status: 400 });
    }

    // Associate subscription with user
    await associateSubscriptionWithUser(userId, subscriptionId);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Subscription Capture Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}