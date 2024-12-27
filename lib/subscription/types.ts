export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  generationsUsed: number;
  maxGenerations: number;
  createdAt: Date;
  updatedAt: Date;
  paypalCurrentPeriodEnd: Date | null;
  paypalPlanId: string | null;
  paypalStatus: string;
  paypalSubscriptionId: string | null;
}

export interface CreateSubscriptionData {
  userId: string;
  plan: SubscriptionPlan;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  generationsUsed?: number;
  maxGenerations?: number;
  paypalPlanId?: string | null;
  paypalStatus?: string;
  paypalSubscriptionId?: string | null;
  paypalCurrentPeriodEnd?: Date | null;
}

export interface UpdateSubscriptionData {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  generationsUsed?: number;
  maxGenerations?: number;
  paypalPlanId?: string | null;
  paypalStatus?: string;
  paypalSubscriptionId?: string | null;
  paypalCurrentPeriodEnd?: Date | null;
}
