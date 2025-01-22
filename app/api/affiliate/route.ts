// app/api/affiliate/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch affiliate data along with commissions
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        commissions: true,
      },
    });

    if (!affiliate) {
      return new NextResponse("Affiliate data not found", { status: 404 });
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error("[AFFILIATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
