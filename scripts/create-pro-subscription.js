const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This should be the Clerk user ID for feliciien@gmail.com
const CLERK_USER_ID = 'user_2YEoLqvYxTZqbxMHXUJXLfHIzxX';

async function main() {
  try {
    // First, create the user if it doesn't exist
    const user = await prisma.user.upsert({
      where: {
        id: CLERK_USER_ID,
      },
      create: {
        id: CLERK_USER_ID,
      },
      update: {},
    });

    console.log('User created/updated:', user);

    // Set the next billing date to 1 year from now
    const nextBillingDate = new Date();
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

    // Create or update the subscription for this user
    const subscription = await prisma.userSubscription.upsert({
      where: {
        userId: CLERK_USER_ID,
      },
      create: {
        userId: CLERK_USER_ID,
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
