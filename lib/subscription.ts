import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return false;
    }

    // Check if user has an active subscription in the database
    const subscription = await db.userSubscription.findUnique({
      where: {
        userId: userId,
      },
      select: {
        paypalSubscriptionId: true,
        paypalCurrentPeriodEnd: true,
      }
    });

    if (!subscription) {
      return false;
    }

    // Check if subscription is active and not expired
    return Boolean(
      subscription.paypalSubscriptionId && 
      subscription.paypalCurrentPeriodEnd &&
      subscription.paypalCurrentPeriodEnd.getTime() > Date.now()
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};