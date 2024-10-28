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

export { PAYPAL_API_BASE, getPayPalAccessToken };