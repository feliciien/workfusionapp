// app/affiliate/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AffiliateDashboardContent } from "./AffiliateDashboardContent";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export default async function AffiliateDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // Redirect to sign-in page
    redirect("/auth/signin");
  }

  // Check if the user is an affiliate
  let affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
    include: {
      commissions: true,
    },
  });

  if (!affiliate) {
    // Generate a unique referral code
    const referralCode = crypto.randomBytes(5).toString("hex");

    // Create an affiliate entry for the user
    affiliate = await prisma.affiliate.create({
      data: {
        userId: session.user.id,
        referralCode,
      },
      include: {
        commissions: true,
      },
    });
  }

  // Serialize dates in affiliate and commissions
  const serializedAffiliate = {
    ...affiliate,
    createdAt: affiliate.createdAt.toISOString(),
    updatedAt: affiliate.updatedAt.toISOString(),
    commissions: affiliate.commissions.map((commission) => ({
      ...commission,
      createdAt: commission.createdAt.toISOString(),
      updatedAt: commission.updatedAt.toISOString(),
    })),
  };

  return <AffiliateDashboardContent affiliate={serializedAffiliate} />;
}
