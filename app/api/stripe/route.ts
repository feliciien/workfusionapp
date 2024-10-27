// route.ts
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { absoluteUrl } from "@/lib/utils";
import axios from "axios";

// Define settingsUrl here
const settingsUrl = absoluteUrl("/settings");

// PayPal API base URL and credentials
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Function to get an access token from PayPal
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not set correctly.");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error: unknown) {
    console.error("[PAYPAL_TOKEN_ERROR]", error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("PayPal authentication failed. Please check your client credentials.");
    }
    throw new Error("Failed to obtain PayPal access token.");
  }
}

// Function to create a PayPal order
async function createPayPalOrder(accessToken: string): Promise<string> {
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "10.00",
            },
            description: "WorkFusionApp Pro Subscription",
          },
        ],
        application_context: {
          brand_name: "WorkFusionApp",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${settingsUrl}?success=true`,
          cancel_url: `${settingsUrl}?canceled=true`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Find the approval URL from the response
    const approvalUrl = response.data.links.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("Approval URL not found in PayPal order response.");
    }

    return approvalUrl;
  } catch (error: unknown) {
    console.error("[PAYPAL_ORDER_ERROR]", error);
    throw new Error("Failed to create PayPal order.");
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    if (userSubscription) {
      return new NextResponse(JSON.stringify({ url: settingsUrl }), { status: 200 });
    }

    // Get the PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create a PayPal order
    const approvalUrl = await createPayPalOrder(accessToken);

    // Return the approval URL for the user to approve the payment
    return new NextResponse(JSON.stringify({ url: approvalUrl }), { status: 200 });
  } catch (error) {
    console.error("[PAYPAL_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}