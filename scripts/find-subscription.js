const axios = require('axios');
require('dotenv').config();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  try {
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
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function findSubscriptionByEmail(accessToken, email) {
  try {
    // First, try to find by email
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions?subscriber_email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error finding subscription:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    // Get email from command line argument
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node find-subscription.js <email>');
      process.exit(1);
    }

    console.log('Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log(`\nSearching for subscriptions for email: ${email}`);
    const subscriptions = await findSubscriptionByEmail(accessToken, email);
    
    if (subscriptions && subscriptions.subscriptions) {
      console.log(`Found ${subscriptions.subscriptions.length} subscription(s):`);
      subscriptions.subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription ${index + 1}:`);
        console.log('ID:', sub.id);
        console.log('Status:', sub.status);
        console.log('Plan ID:', sub.plan_id);
        console.log('Create time:', sub.create_time);
        console.log('Next billing time:', sub.billing_info?.next_billing_time);
      });
    } else {
      console.log('No subscriptions found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
