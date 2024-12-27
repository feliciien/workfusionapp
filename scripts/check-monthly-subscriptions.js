const axios = require('axios');
require('dotenv').config();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const MONTHLY_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID;

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

async function listSubscriptionsForPlan(accessToken) {
  try {
    console.log('Checking plan:', MONTHLY_PLAN_ID);
    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions?plan_id=${MONTHLY_PLAN_ID}&status=ACTIVE`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error listing subscriptions:', error.response?.data || error.message);
    return null;
  }
}

async function getSubscriptionDetails(accessToken, subscriptionId) {
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
    console.error(`Error getting subscription ${subscriptionId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log('\nListing active subscriptions for monthly plan...');
    const subscriptions = await listSubscriptionsForPlan(accessToken);
    
    if (subscriptions && subscriptions.subscriptions) {
      console.log(`\nFound ${subscriptions.subscriptions.length} active subscription(s)`);
      
      for (const sub of subscriptions.subscriptions) {
        console.log('\n----------------------------------------');
        console.log('Subscription ID:', sub.id);
        console.log('Status:', sub.status);
        console.log('Create time:', sub.create_time);
        console.log('Next billing time:', sub.billing_info?.next_billing_time);
        
        // Get detailed information
        const details = await getSubscriptionDetails(accessToken, sub.id);
        if (details) {
          console.log('Custom ID (User ID):', details.custom_id || 'Not set');
          if (details.subscriber) {
            console.log('Subscriber Name:', details.subscriber.name?.given_name, details.subscriber.name?.surname);
            console.log('Subscriber Email:', details.subscriber.email_address);
          }
          console.log('Last Payment:', details.billing_info?.last_payment?.amount?.value, details.billing_info?.last_payment?.amount?.currency_code);
          console.log('Next Payment:', details.billing_info?.next_billing?.amount?.value, details.billing_info?.next_billing?.amount?.currency_code);
        }
        console.log('----------------------------------------');
      }
    } else {
      console.log('No active subscriptions found for this plan');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
