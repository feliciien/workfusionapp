const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Set the next billing date to 1 year from now
    const nextBillingDate = new Date();
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

    // Create or update the subscription for this user
    const subscription = await prisma.userSubscription.upsert({
      where: {
        userId: 'feliciien@gmail.com', // Using email as userId since we're testing
      },
      create: {
        userId: 'feliciien@gmail.com',
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
