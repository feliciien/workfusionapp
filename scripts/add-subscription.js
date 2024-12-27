const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addSubscription(userId, subscriptionId) {
  try {
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: userId,
        paypalSubscriptionId: subscriptionId,
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID
      }
    });
    
    console.log('Successfully added subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get the user ID from command line argument
const userId = process.argv[2];
const subscriptionId = process.argv[3];

if (!userId || !subscriptionId) {
  console.log('Usage: node add-subscription.js <userId> <subscriptionId>');
  process.exit(1);
}

addSubscription(userId, subscriptionId);
