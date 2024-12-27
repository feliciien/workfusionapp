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

async function listSubscriptions(accessToken) {
  try {
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions?plan_id=${PLAN_ID}&page_size=20`,
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

    console.log('\nListing subscriptions for plan:', PLAN_ID);
    const subscriptions = await listSubscriptions(accessToken);
    
    if (subscriptions && subscriptions.subscriptions) {
      console.log(`\nFound ${subscriptions.subscriptions.length} subscriptions:`);
      
      for (const subscription of subscriptions.subscriptions) {
        console.log('\n----------------------------------------');
        console.log('Subscription ID:', subscription.id);
        console.log('Status:', subscription.status);
        console.log('Create time:', subscription.create_time);
        console.log('Next billing time:', subscription.billing_info?.next_billing_time);
        console.log('Subscriber:');
        console.log('  Name:', subscription.subscriber.name.given_name, subscription.subscriber.name.surname);
        console.log('  Email:', subscription.subscriber.email_address);
        console.log('----------------------------------------');
      }
    } else {
      console.log('No subscriptions found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
