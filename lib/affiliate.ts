// lib/affiliate.ts

import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates an affiliate entry for a user with a unique referral code.
 * @param userId - The ID of the user becoming an affiliate.
 */
export async function createAffiliate(userId: string) {
  const referralCode = uuidv4();

  const affiliate = await prisma.affiliate.create({
    data: {
      userId,
      referralCode,
    },
  });

  return affiliate;
}

/**
 * Retrieves an affiliate by their referral code.
 * @param referralCode - The referral code to look up.
 */
export async function getAffiliateByReferralCode(referralCode: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { referralCode },
  });

  return affiliate;
}

/**
 * Records a referral when a new user signs up using a referral code.
 * @param affiliateId - The ID of the affiliate who referred the user.
 * @param referredUserId - The ID of the newly registered user.
 */
export async function recordReferral(affiliateId: string, referredUserId: string) {
  await prisma.commission.create({
    data: {
      affiliateId,
      referredUserId,
      amount: 0, // Commission amount will be updated upon subscription payment.
      status: 'pending',
    },
  });
}

/**
 * Updates commission amount when a referred user makes a subscription payment.
 * @param referredUserId - The ID of the referred user who made a payment.
 * @param paymentAmount - The amount of the subscription payment.
 */
export async function updateCommission(referredUserId: string, paymentAmount: number) {
  const commissionRate = 0.03; // 3% commission

  await prisma.commission.updateMany({
    where: {
      referredUserId,
      status: 'pending',
    },
    data: {
      amount: paymentAmount * commissionRate,
      status: 'earned',
    },
  });
}
