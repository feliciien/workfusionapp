import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFeatureUsage } from "@/lib/api-limit";
import { FEATURE_TYPES } from "@/constants";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const usage = await getFeatureUsage(userId, FEATURE_TYPES.API_USAGE);

    return NextResponse.json(usage);
  } catch (error) {
    console.error("[API_LIMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
