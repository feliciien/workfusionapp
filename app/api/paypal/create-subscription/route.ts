import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Replace these with your actual PayPal plan IDs
const PLAN_DETAILS = {
  monthly: { plan_id: "P-8Y551355TK076831TM5M7OZA" }, // Your actual Monthly Plan ID
  yearly: { plan_id: "P-67X44179VA3351546M5M7P5I" },  // Your actual Yearly Plan ID
} as const;

type PlanType = keyof typeof PLAN_DETAILS;

async function createSubscription(plan: PlanType, userId: string) {
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

    // Check plan status first
    const planResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans/${PLAN_DETAILS[plan].plan_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      console.error("PayPal Plan Error:", errorText);
      throw new Error("Failed to fetch plan details");
    }

    const planDetails = await planResponse.json();
    
    // If plan is not active, activate it
    if (planDetails.status !== "ACTIVE") {
      const activateResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans/${PLAN_DETAILS[plan].plan_id}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!activateResponse.ok) {
        const errorText = await activateResponse.text();
        console.error("PayPal Plan Activation Error:", errorText);
        throw new Error("Failed to activate plan");
      }
    }

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
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal Subscription Error:", errorText);
      throw new Error("Failed to create PayPal subscription");
    }

    return await subscriptionResponse.json();
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
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
    const plan = searchParams.get('plan') as PlanType || 'monthly';

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

    const { plan } = await req.json();
    
    if (!plan || !PLAN_DETAILS[plan as PlanType]) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid subscription plan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const subscription = await createSubscription(plan as PlanType, user.id);

    return new NextResponse(
      JSON.stringify(subscription),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create subscription" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}