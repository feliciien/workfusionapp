// /lib/paypal.ts
import axios from "axios";

// PayPal API configuration
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com"; // Live API base URL
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID as string;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET as string;

// Function to get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

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
  } catch (error) {
    console.error("[PAYPAL_TOKEN_ERROR]", error);
    throw new Error("Failed to obtain PayPal access token.");
  }
}

// Function to get subscription details
async function getSubscriptionDetails(subscriptionId: string, accessToken: string) {
  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[PAYPAL_SUBSCRIPTION_ERROR]", error);
    return null;
  }
}

// Function to verify subscription status
async function verifySubscription(subscriptionId: string): Promise<{
  isValid: boolean;
  status?: string;
  planId?: string;
  nextBillingTime?: string;
}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const subscription = await getSubscriptionDetails(subscriptionId, accessToken);

    if (!subscription) {
      return { isValid: false };
    }

    const isValid = ['ACTIVE', 'APPROVED'].includes(subscription.status);
    return {
      isValid,
      status: subscription.status,
      planId: subscription.plan_id,
      nextBillingTime: subscription.billing_info?.next_billing_time
    };
  } catch (error) {
    console.error("[SUBSCRIPTION_VERIFY_ERROR]", error);
    return { isValid: false };
  }
}

// Function to cancel subscription
async function cancelSubscription(subscriptionId: string): Promise<Response> {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("[PAYPAL_CANCEL_ERROR]", error);
    throw new Error("Failed to cancel subscription with PayPal");
  }
}

const paypalApi = {
  getPayPalAccessToken,
  getSubscriptionDetails,
  verifySubscription,
  cancelSubscription,
};

export { 
  PAYPAL_API_BASE,
  paypalApi
};