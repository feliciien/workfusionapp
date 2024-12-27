const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all subscriptions
    const subscriptions = await prisma.userSubscription.findMany();
    
    console.log('\nAll Subscriptions:');
    console.log(JSON.stringify(subscriptions, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
