// /api/paypal/route.ts
import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";
import axios from "axios";

export async function GET(request: Request) {
  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create a PayPal order
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "0.01",
            },
            description: "WorkFusionApp Pro Subscription",
          },
        ],
        application_context: {
          brand_name: "WorkFusionApp",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: "https://yourwebsite.com/success",
          cancel_url: "https://yourwebsite.com/cancel",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Find the approval URL
    const approvalUrl = response.data.links.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("Approval URL not found in PayPal order response.");
    }

    // Return the approval URL for redirection
    return NextResponse.json({ url: approvalUrl }, { status: 200 });
  } catch (error) {
    console.error("[PAYPAL_ORDER_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}