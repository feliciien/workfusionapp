import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Replace these with your actual PayPal plan IDs
const PLAN_DETAILS = {
  monthly: { plan_id: "P-8Y551355TK076831TM5M7OZA" },
  yearly: { plan_id: "P-9LL83744K0141123KM5RXMMQ" },
} as const;

type PlanType = keyof typeof PLAN_DETAILS;

async function getPayPalAccessToken() {
  const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal Auth Error:", errorText);
    throw new Error("Failed to get PayPal access token");
  }

  const { access_token } = await response.json();
  return access_token;
}

async function createSubscription(plan: PlanType, userId: string) {
  if (!PAYPAL_API_BASE || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing required PayPal configuration");
  }

  try {
    const access_token = await getPayPalAccessToken();

    // Create Subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${userId}-${Date.now()}`, // Idempotency key
      },
      body: JSON.stringify({
        plan_id: PLAN_DETAILS[plan].plan_id,
        subscriber: {
          name: {
            given_name: "Subscriber",
          },
          email_address: "subscriber@example.com", // This will be updated by PayPal during checkout
        },
        application_context: {
          brand_name: "WorkFusion",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
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

    const subscription = await subscriptionResponse.json();
    return subscription;
  } catch (error) {
    console.error("Error in createSubscription:", error);
    throw error;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
          } 
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan') as PlanType || 'monthly';

    if (!PLAN_DETAILS[plan]) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid subscription plan" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
          } 
        }
      );
    }

    const subscription = await createSubscription(plan, session.user.id);

    return new NextResponse(
      JSON.stringify(subscription),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
        } 
      }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
        } 
      }
    );
  }
}