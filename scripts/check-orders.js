const axios = require('axios');
require('dotenv').config();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const EMAIL = 'badouddiouf@hotmail.fr';

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

async function searchOrders(accessToken) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Look back 30 days
  
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: "0.00"
          }
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching orders:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log('\nSearching for recent orders...');
    const orders = await searchOrders(accessToken);
    
    if (orders) {
      console.log('\nOrder search response:');
      console.log(JSON.stringify(orders, null, 2));
    } else {
      console.log('No orders found');
    }

    // Try to access /v1/billing/subscriptions directly
    try {
      console.log('\nTrying to access subscriptions directly...');
      const subsResponse = await axios.get(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Subscriptions response:', JSON.stringify(subsResponse.data, null, 2));
    } catch (error) {
      console.error('Error accessing subscriptions:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
