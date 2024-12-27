const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// The Clerk user ID we used
const CLERK_USER_ID = 'user_2YEoLqvYxTZqbxMHXUJXLfHIzxX';

async function main() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: CLERK_USER_ID,
      },
      include: {
        subscription: true,
      },
    });

    console.log('User record:', user);

    if (user?.subscription) {
      // Check if subscription is valid
      const isValid = 
        user.subscription.paypalStatus === "ACTIVE" &&
        user.subscription.paypalCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now();

      console.log('\nSubscription status:');
      console.log('Status:', user.subscription.paypalStatus);
      console.log('Expires:', user.subscription.paypalCurrentPeriodEnd);
      console.log('Is Valid:', isValid);
    } else {
      console.log('No subscription found');
    }

    // List all users and their subscriptions
    console.log('\nAll users and subscriptions:');
    const allUsers = await prisma.user.findMany({
      include: {
        subscription: true,
      },
    });

    allUsers.forEach(user => {
      console.log(`\nUser ID: ${user.id}`);
      console.log('Subscription:', user.subscription);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
