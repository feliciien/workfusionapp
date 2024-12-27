require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const prisma = new PrismaClient();

const EMAIL = 'feliciien@gmail.com';

async function main() {
  try {
    // Initialize Clerk client
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }

    // Find the user in Clerk by email
    console.log('Looking up user in Clerk...');
    const users = await clerkClient.users.getUserList({
      emailAddress: [EMAIL],
    });

    if (users.length === 0) {
      throw new Error(`No user found with email ${EMAIL}`);
    }

    const user = users[0];
    console.log('Found user:', user.id);

    // Set the next billing date to 1 year from now
    const nextBillingDate = new Date();
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

    // Create or update the subscription for this user
    const subscription = await prisma.userSubscription.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        paypalSubscriptionId: 'manual_test_sub',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID || 'P-8Y551355TK076831TM5M7OZA',
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: nextBillingDate,
      },
      update: {
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: nextBillingDate,
      },
    });

    console.log('Pro subscription added/updated:', subscription);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
