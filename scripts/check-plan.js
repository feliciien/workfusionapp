const axios = require('axios');
require('dotenv').config();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID;

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

async function getPlanDetails(accessToken) {
  try {
    console.log('Checking plan:', PLAN_ID);
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/plans/${PLAN_ID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting plan details:', error.response?.data || error.message);
    return null;
  }
}

async function listSubscriptionsForPlan(accessToken) {
  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions?plan_id=${PLAN_ID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error listing subscriptions:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log('\nGetting plan details...');
    const planDetails = await getPlanDetails(accessToken);
    if (planDetails) {
      console.log('Plan Details:');
      console.log('Name:', planDetails.name);
      console.log('Status:', planDetails.status);
      console.log('Description:', planDetails.description);
    }

    console.log('\nListing subscriptions for this plan...');
    const subscriptions = await listSubscriptionsForPlan(accessToken);
    if (subscriptions && subscriptions.subscriptions) {
      console.log(`Found ${subscriptions.subscriptions.length} subscription(s)`);
      subscriptions.subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription ${index + 1}:`);
        console.log('ID:', sub.id);
        console.log('Status:', sub.status);
        console.log('Create time:', sub.create_time);
        console.log('Next billing time:', sub.billing_info?.next_billing_time);
        if (sub.subscriber) {
          console.log('Subscriber:', sub.subscriber.email_address);
        }
      });
    } else {
      console.log('No subscriptions found for this plan');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
