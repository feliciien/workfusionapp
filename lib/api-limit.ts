import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { MAX_FREE_COUNTS, FREE_LIMITS, FEATURE_TYPES } from "@/constants";

const FREE_CREDITS = MAX_FREE_COUNTS;

export const increaseFeatureUsage = async (featureType: string) => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return;
    }

    const usage = await db.userFeatureUsage.upsert({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      },
      create: {
        userId,
        featureType,
        count: 1
      },
      update: {
        count: {
          increment: 1
        }
      }
    });

    return usage;
  } catch (error) {
    console.error("[INCREASE_FEATURE_USAGE_ERROR]", error);
  }
};

export const checkFeatureLimit = async (featureType: string) => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return false;
    }

    const isPro = await checkSubscription();
    if (isPro) {
      return true;
    }

    const usage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      }
    });

    const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || FREE_CREDITS;
    if (!usage || usage.count < limit) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[CHECK_FEATURE_LIMIT_ERROR]", error);
    return false;
  }
};

export const getFeatureUsage = async (featureType: string) => {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return {
        count: 0,
        limit: FREE_CREDITS
      };
    }

    const usage = await db.userFeatureUsage.findUnique({
      where: {
        userId_featureType: {
          userId,
          featureType
        }
      }
    });

    const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || FREE_CREDITS;

    return {
      count: usage?.count || 0,
      limit
    };
  } catch (error) {
    console.error("[GET_FEATURE_USAGE_ERROR]", error);
    return {
      count: 0,
      limit: FREE_CREDITS
    };
  }
};

// Keep existing functions for backward compatibility
export const increaseApiLimit = async () => {
  return increaseFeatureUsage(FEATURE_TYPES.API_USAGE);
};

export const checkApiLimit = async () => {
  return checkFeatureLimit(FEATURE_TYPES.API_USAGE);
};

export const getApiLimitCount = async () => {
  const { count, limit } = await getFeatureUsage(FEATURE_TYPES.API_USAGE);
  return {
    count,
    limit
  };
};
