import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Replace these with your actual PayPal plan IDs
const PLAN_DETAILS: Record<string, { plan_id: string }> = {
  monthly: { plan_id: "P-8Y551355TK076831TM5M7OZA" }, // Your actual Monthly Plan ID
  yearly: { plan_id: "P-67X44179VA3351546M5M7P5I" },  // Your actual Yearly Plan ID
};

async function createSubscription(plan: string, userId: string) {
  try {
    // Create Access Token
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
      throw new Error("Failed to fetch PayPal access token");
    }

    const { access_token } = await authResponse.json();

    // Create Subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        plan_id: PLAN_DETAILS[plan].plan_id,
        custom_id: userId,
        application_context: {
          brand_name: "SynthAI",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/paypal-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal Subscription Error:", errorText);
      throw new Error("Failed to create PayPal subscription");
    }

    const subscriptionData = await subscriptionResponse.json();
    return { success: true, data: subscriptionData };
  } catch (error) {
    console.error("Subscription creation error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan') || 'monthly'; // Default to monthly if not specified

    if (!PLAN_DETAILS[plan]) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid subscription plan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        planId: PLAN_DETAILS[plan].plan_id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting plan ID:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to get plan ID" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { plan } = body;
    
    if (!plan || !PLAN_DETAILS[plan]) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid subscription plan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await createSubscription(plan, user.id);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new NextResponse(
      JSON.stringify(result.data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}