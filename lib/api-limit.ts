import { db } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { MAX_FREE_COUNTS, FREE_LIMITS, FEATURE_TYPES } from "@/constants";

const FREE_CREDITS = MAX_FREE_COUNTS;

export const increaseFeatureUsage = async (userId: string, featureType: string) => {
  try {
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

export const checkFeatureLimit = async (userId: string, featureType: string) => {
  try {
    if (!userId) {
      return false;
    }

    const isPro = await checkSubscription(userId);
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

    const count = usage?.count || 0;
    const limit = FREE_LIMITS[featureType] || FREE_CREDITS;

    return count < limit;
  } catch (error) {
    console.error("[CHECK_FEATURE_LIMIT_ERROR]", error);
    return false;
  }
};

export const getFeatureUsage = async (userId: string, featureType: string) => {
  try {
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

    const count = usage?.count || 0;
    const limit = FREE_LIMITS[featureType] || FREE_CREDITS;

    return {
      count,
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
export const increaseApiLimit = async (userId: string) => {
  return increaseFeatureUsage(userId, FEATURE_TYPES.API_USAGE);
};

export const checkApiLimit = async (userId: string) => {
  return checkFeatureLimit(userId, FEATURE_TYPES.API_USAGE);
};

export const getApiLimitCount = async (userId: string): Promise<number> => {
  const { count } = await getFeatureUsage(userId, FEATURE_TYPES.API_USAGE);
  return count;
};
