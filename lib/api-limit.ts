// lib/api-limit.ts

import { FREE_DAILY_LIMIT, FEATURE_TYPES } from "@/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import {
  incrementFeatureUsage as incrementFeature,
  checkFeatureLimit as checkFeature,
  getFeatureUsage as getFeature,
} from "./feature-limit";

// Re-export the feature-limit functions with their original names for compatibility
export const increaseFeatureUsage = incrementFeature;
export const checkFeatureLimit = checkFeature;

// Enhanced getApiLimitCount that aggregates all feature usage
export const getApiLimitCount = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      count: 0,
      limit: FREE_DAILY_LIMIT,
      limits: {},
    };
  }

  let totalCount = 0;
  let limits: { [key: string]: number } = {};

  // Get usage for each feature type
  for (const featureType of Object.values(FEATURE_TYPES)) {
    const usage = await getFeature(featureType);
    
    // Count each feature's usage towards the daily limit
    totalCount += usage;
    
    if (usage > 0) {
      limits[featureType] = usage;
    }
  }

  return {
    count: totalCount,
    limit: FREE_DAILY_LIMIT,
    limits,
    remaining: Math.max(0, FREE_DAILY_LIMIT - totalCount),
  };
};
