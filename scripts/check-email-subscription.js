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

async function searchTransactions(accessToken) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Look back 6 months

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/reporting/transactions`,
      {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
        fields: [
          "transaction_info",
          "payer_info",
          "shipping_info",
          "auction_info",
          "cart_info",
          "incentive_info",
          "store_info"
        ],
        page_size: 100,
        page: 1
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
    console.error('Error searching transactions:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    console.log(`Checking subscriptions for email: ${EMAIL}`);
    
    console.log('\nGetting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('Access token obtained successfully');

    console.log('\nSearching transactions...');
    const transactions = await searchTransactions(accessToken);
    
    if (transactions && transactions.transaction_details) {
      console.log(`Found ${transactions.transaction_details.length} transactions`);
      
      const subscriptionTransactions = transactions.transaction_details.filter(t => 
        t.payer_info.email_address.toLowerCase() === EMAIL.toLowerCase() &&
        t.transaction_info.transaction_event_code.includes('SUBSCRIPTION')
      );

      if (subscriptionTransactions.length > 0) {
        console.log(`\nFound ${subscriptionTransactions.length} subscription-related transactions:`);
        
        for (const transaction of subscriptionTransactions) {
          console.log('\n----------------------------------------');
          console.log('Transaction ID:', transaction.transaction_info.transaction_id);
          console.log('Event Code:', transaction.transaction_info.transaction_event_code);
          console.log('Status:', transaction.transaction_info.transaction_status);
          console.log('Date:', transaction.transaction_info.transaction_initiation_date);
          console.log('Amount:', transaction.transaction_info.transaction_amount.value, transaction.transaction_info.transaction_amount.currency_code);
          
          if (transaction.transaction_info.subscription_id) {
            console.log('\nFetching subscription details...');
            const subscriptionDetails = await getSubscriptionDetails(accessToken, transaction.transaction_info.subscription_id);
            
            if (subscriptionDetails) {
              console.log('Subscription ID:', subscriptionDetails.id);
              console.log('Status:', subscriptionDetails.status);
              console.log('Plan ID:', subscriptionDetails.plan_id);
              console.log('Create time:', subscriptionDetails.create_time);
              console.log('Next billing time:', subscriptionDetails.billing_info?.next_billing_time);
            }
          }
          console.log('----------------------------------------');
        }
      } else {
        console.log('No subscription transactions found for this email');
      }
    } else {
      console.log('No transactions found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
