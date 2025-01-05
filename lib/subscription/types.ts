export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface Subscription {
  id: string;
  userId: string;
  planId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  paypalSubscriptionId: string | null;
  plan: string;
}

export interface CreateSubscriptionData {
  userId: string;
  planId?: string | null;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  paypalSubscriptionId?: string | null;
}

export interface UpdateSubscriptionData {
  planId?: string | null;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  paypalSubscriptionId?: string | null;
}
