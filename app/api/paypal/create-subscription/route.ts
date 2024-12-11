import { NextResponse } from "next/server";

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Replace these with your actual PayPal plan IDs
const PLAN_DETAILS: Record<string, { plan_id: string }> = {
  monthly: { plan_id: "P-8Y551355TK076831TM5M7OZA" }, // Your actual Monthly Plan ID
  yearly: { plan_id: "P-67X44179VA3351546M5M7P5I" },  // Your actual Yearly Plan ID
};

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    if (!plan || !PLAN_DETAILS[plan]) {
      console.error("Invalid subscription plan requested:", plan);
      return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
    }

    // Create Access Token
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
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
    console.log("Obtained PayPal access token.");

    // Create Subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: PLAN_DETAILS[plan].plan_id,
        application_context: {
          brand_name: "SynthAI",
          logo_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`, // Ensure this URL is accessible
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
      return NextResponse.json({ error: "Failed to create PayPal subscription." }, { status: 500 });
    }

    const subscriptionData = await subscriptionResponse.json();
    console.log("Subscription created successfully:", subscriptionData);

    const approvalUrl = subscriptionData.links.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("Approval URL not found in PayPal response.");
      return NextResponse.json({ error: "Approval URL not found." }, { status: 500 });
    }

    console.log("Redirecting user to PayPal approval URL:", approvalUrl);
    return NextResponse.json({ url: approvalUrl }, { status: 200 });
  } catch (error) {
    console.error("PayPal API Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}