import { auth } from "@clerk/nextjs";

export const checkSubscription = async (): Promise<boolean> => {
  try {
    const session = await auth();
    if (!session?.userId) {
      return false;
    }

    // TODO: Implement proper subscription check once database is set up
    // For now, return true to enable all features
    return true;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};