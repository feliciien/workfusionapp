const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// The correct Clerk user ID
const CLERK_USER_ID = 'user_2qGIkQqVjqOBelNB3plLU43wc2x';

async function main() {
  try {
    console.log('\n1. Checking user record...');
    const user = await prisma.user.findUnique({
      where: { id: CLERK_USER_ID },
      include: { subscription: true }
    });

    console.log('User:', {
      id: user?.id,
      createdAt: user?.createdAt,
      hasSubscription: !!user?.subscription
    });

    console.log('\n2. Checking subscription record...');
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: CLERK_USER_ID }
    });

    console.log('Subscription:', subscription);

    if (subscription) {
      console.log('\n3. Validating subscription...');
      const currentTime = new Date();
      const expiryTime = subscription.paypalCurrentPeriodEnd;
      const gracePeriod = 86_400_000; // 24 hours in milliseconds

      console.log('Validation details:', {
        currentTime: currentTime.toISOString(),
        expiryTime: expiryTime?.toISOString(),
        isActive: subscription.paypalStatus === 'ACTIVE',
        isValid: Boolean(
          subscription.paypalSubscriptionId &&
          subscription.paypalStatus === 'ACTIVE' &&
          expiryTime &&
          expiryTime.getTime() + gracePeriod > currentTime.getTime()
        )
      });
    }

    console.log('\n4. Checking all subscriptions in database...');
    const allSubscriptions = await prisma.userSubscription.findMany({
      include: { user: true }
    });

    console.log('All subscriptions:', allSubscriptions);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
