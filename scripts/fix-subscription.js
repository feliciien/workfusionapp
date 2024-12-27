const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// The correct Clerk user ID
const CLERK_USER_ID = 'user_2qGIkQqVjqOBelNB3plLU43wc2x';

async function main() {
  try {
    // First, delete any existing subscriptions with the test subscription ID
    console.log('Cleaning up old subscriptions...');
    await prisma.userSubscription.deleteMany({
      where: {
        paypalSubscriptionId: 'manual_test_sub',
      },
    });

    // Delete the old user and their subscription
    console.log('Cleaning up old user...');
    await prisma.user.deleteMany({
      where: {
        id: 'user_2YEoLqvYxTZqbxMHXUJXLfHIzxX',
      },
    });

    // Create or update the user
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

    // Create the subscription for this user
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: CLERK_USER_ID,
        paypalSubscriptionId: 'manual_test_sub',
        paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID || 'P-8Y551355TK076831TM5M7OZA',
        paypalStatus: 'ACTIVE',
        paypalCurrentPeriodEnd: nextBillingDate,
      },
    });

    console.log('Pro subscription created:', subscription);

    // Verify the subscription
    const verifySubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: CLERK_USER_ID,
      },
    });

    console.log('\nVerifying subscription:', verifySubscription);

    const isValid = 
      verifySubscription?.paypalStatus === "ACTIVE" &&
      verifySubscription?.paypalCurrentPeriodEnd &&
      verifySubscription.paypalCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();

    console.log('Subscription is valid:', isValid);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
