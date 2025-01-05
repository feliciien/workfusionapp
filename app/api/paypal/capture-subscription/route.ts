import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prismadb from "@/lib/prismadb";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function associateSubscriptionWithUser(userId: string, subscriptionId: string): Promise<void> {
  await prismadb.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      paypalSubscriptionId: subscriptionId,
      paypalStatus: "ACTIVE",
      paypalCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    update: {
      paypalSubscriptionId: subscriptionId,
      paypalStatus: "ACTIVE",
      paypalCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return new NextResponse(
        JSON.stringify({ error: "Subscription ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtain Access Token
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal Auth Error:", errorText);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch PayPal access token" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { access_token } = await authResponse.json();

    // Get subscription details
    const subscriptionResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal Subscription Error:", errorText);
      return new NextResponse(
        JSON.stringify({ error: "Failed to verify subscription" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const subscriptionDetails = await subscriptionResponse.json();

    // Verify subscription status
    if (subscriptionDetails.status !== "ACTIVE") {
      return new NextResponse(
        JSON.stringify({ error: "Subscription is not active" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Associate subscription with user
    await associateSubscriptionWithUser(session.user.id, subscriptionId);

    return new NextResponse(
      JSON.stringify({ success: true, message: "Subscription activated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Subscription Capture Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to activate subscription" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}