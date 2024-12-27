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

async function main() {
  try {
    console.log('Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log('\nGetting plan details...');
    const plan = await getPlanDetails(accessToken);
    
    if (plan) {
      console.log('\nPlan Details:');
      console.log('----------------------------------------');
      console.log('Plan ID:', plan.id);
      console.log('Status:', plan.status);
      console.log('Name:', plan.name);
      console.log('Description:', plan.description);
      console.log('Create time:', plan.create_time);
      console.log('Update time:', plan.update_time);
      
      if (plan.billing_cycles) {
        console.log('\nBilling Cycles:');
        plan.billing_cycles.forEach((cycle, index) => {
          console.log(`\nCycle ${index + 1}:`);
          console.log('Frequency:', cycle.frequency.interval_unit, 'every', cycle.frequency.interval_count);
          console.log('Tenure type:', cycle.tenure_type);
          if (cycle.pricing_scheme && cycle.pricing_scheme.fixed_price) {
            console.log('Price:', cycle.pricing_scheme.fixed_price.value, cycle.pricing_scheme.fixed_price.currency_code);
          }
        });
      }
      
      console.log('\nPayment preferences:');
      console.log('Auto bill outstanding:', plan.payment_preferences?.auto_bill_outstanding);
      console.log('Setup fee:', plan.payment_preferences?.setup_fee?.value, plan.payment_preferences?.setup_fee?.currency_code);
      console.log('----------------------------------------');
    }

    // Also check if we can access the products endpoint
    console.log('\nTrying to access products endpoint...');
    try {
      const productsResponse = await axios.get(
        `${PAYPAL_API_BASE}/v1/catalogs/products`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Products endpoint accessible:', !!productsResponse.data);
    } catch (error) {
      console.error('Error accessing products:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
