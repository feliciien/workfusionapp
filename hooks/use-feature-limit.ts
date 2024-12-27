import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FREE_LIMITS, FEATURE_TYPES } from '@/constants';

type FeatureType = typeof FEATURE_TYPES[keyof typeof FEATURE_TYPES];

interface FeatureLimit {
  [key: string]: number;
}

interface FeatureLimitStore {
  featureUsage: FeatureLimit;
  incrementFeatureUsage: (featureType: FeatureType) => void;
  hasReachedLimit: (featureType: FeatureType) => boolean;
  getRemainingUsage: (featureType: FeatureType) => number;
  resetUsage: () => void;
}

export const useFeatureLimit = create<FeatureLimitStore>()(
  persist(
    (set, get) => ({
      featureUsage: {},
      incrementFeatureUsage: (featureType: FeatureType) => {
        set((state) => ({
          featureUsage: {
            ...state.featureUsage,
            [featureType]: (state.featureUsage[featureType] || 0) + 1,
          },
        }));
      },
      hasReachedLimit: (featureType: FeatureType) => {
        const currentUsage = get().featureUsage[featureType] || 0;
        const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || 0;
        return currentUsage >= limit;
      },
      getRemainingUsage: (featureType: FeatureType) => {
        const currentUsage = get().featureUsage[featureType] || 0;
        const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || 0;
        return Math.max(0, limit - currentUsage);
      },
      resetUsage: () => {
        set({ featureUsage: {} });
      },
    }),
    {
      name: 'feature-limit-storage',
    }
  )
);
