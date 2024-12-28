import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 });
    }

    // Get PayPal access token
    const tokenResponse = await fetch(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenResponse.json();

    // Create subscription
    const response = await fetch(`${process.env.PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: userId,
        application_context: {
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
        },
      }),
    });

    const subscription = await response.json();

    if (!response.ok) {
      console.error("PayPal API Error:", subscription);
      return new NextResponse("PayPal API Error", { status: 500 });
    }

    // Find approval URL
    const approvalUrl = subscription.links.find(
      (link: any) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      return new NextResponse("No approval URL found", { status: 500 });
    }

    return NextResponse.json({ url: approvalUrl });
  } catch (error) {
    console.error("[PAYPAL_SUBSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
