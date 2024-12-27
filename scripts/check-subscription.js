const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
require('dotenv').config();

const prisma = new PrismaClient();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data.access_token;
}

async function checkSubscription(subscriptionId, accessToken) {
  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    const userId = "user_2qGIkQqVjqOBelNB3plLU43wc2x";
    
    // Get user's subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });
    
    console.log('User subscription in database:', subscription);

    if (!subscription) {
      console.log('No subscription found for user');
      return;
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Check subscription status in PayPal
    if (subscription.paypalSubscriptionId) {
      const paypalSubscription = await checkSubscription(subscription.paypalSubscriptionId, accessToken);
      console.log('PayPal subscription status:', paypalSubscription);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
