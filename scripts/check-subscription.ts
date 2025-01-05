import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

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

async function checkSubscription(subscriptionId: string, accessToken: string) {
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
    console.error('Error fetching subscription:', error);
    return null;
  }
}

async function main() {
  try {
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany();
    
    if (subscriptions.length === 0) {
      console.log('No subscriptions found in database');
      return;
    }

    const accessToken = await getPayPalAccessToken();

    for (const sub of subscriptions) {
      console.log('\nChecking subscription for user:', sub.userId);
      console.log('Database status:', {
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        subscriptionId: sub.paypalSubscriptionId
      });

      if (sub.paypalSubscriptionId) {
        const paypalSub = await checkSubscription(sub.paypalSubscriptionId, accessToken);
        if (paypalSub) {
          console.log('PayPal status:', {
            status: paypalSub.status,
            nextBillingTime: paypalSub.billing_info?.next_billing_time
          });

          // Update database if status doesn't match
          if (paypalSub.status !== sub.status) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                status: paypalSub.status,
                currentPeriodEnd: new Date(paypalSub.billing_info.next_billing_time)
              }
            });
            console.log('Updated subscription status in database');
          }
        } else {
          console.log('Could not fetch PayPal subscription');
        }
      } else {
        console.log('No PayPal subscription ID found');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
