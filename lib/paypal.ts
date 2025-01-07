// /lib/paypal.ts
import axios from "axios";

// PayPal API configuration
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com"; // Live API base URL
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Check if we're in production and credentials are missing
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && (!CLIENT_ID || !CLIENT_SECRET)) {
  console.error("PayPal credentials missing in production environment");
}

// Function to get PayPal access token
async function generateAccessToken() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("PayPal credentials missing:", { 
        hasClientId: !!CLIENT_ID, 
        hasClientSecret: !!CLIENT_SECRET,
        environment: process.env.NODE_ENV 
      });
      throw new Error("PayPal credentials not configured");
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate PayPal access token:", error);
    throw error;
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
export async function verifySubscription(subscriptionId: string): Promise<{
  isValid: boolean;
  status?: string;
  planId?: string;
  nextBillingTime?: string;
}> {
  try {
    const accessToken = await generateAccessToken();
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
export async function cancelSubscription(subscriptionId: string): Promise<Response> {
  try {
    const accessToken = await generateAccessToken();
    
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

export const paypal = {
  async createOrder(data: any) {
    try {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("PayPal credentials not configured");
      }

      const accessToken = await generateAccessToken();
      const response = await axios.post(
        `${PAYPAL_API_BASE}/v2/checkout/orders`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create PayPal order:", error);
      throw error;
    }
  },

  async captureOrder(orderID: string) {
    const accessToken = await generateAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  },

  async getSubscriptionDetails(subscriptionId: string) {
    try {
      const accessToken = await generateAccessToken();
      const response = await axios.get(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        status: response.data.status,
        nextBillingTime: response.data.billing_info?.next_billing_time,
        planId: response.data.plan_id,
      };
    } catch (error) {
      console.error("[GET_SUBSCRIPTION_DETAILS_ERROR]", error);
      throw new Error("Failed to get subscription details");
    }
  },

  async cancelSubscription(subscriptionId: string) {
    try {
      const accessToken = await generateAccessToken();
      await axios.post(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return true;
    } catch (error) {
      console.error("[CANCEL_SUBSCRIPTION_ERROR]", error);
      throw new Error("Failed to cancel subscription");
    }
  }
};

export { 
  PAYPAL_API_BASE,
  generateAccessToken as getPayPalAccessToken
};