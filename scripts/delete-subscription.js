const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const userId = "user_2qGIkQqVjqOBelNB3plLU43wc2x";
    
    // Delete the subscription
    const deletedSubscription = await prisma.userSubscription.delete({
      where: {
        userId: userId,
      },
    });
    
    console.log('Deleted subscription:', deletedSubscription);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
