import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { checkSubscription } from "@/lib/subscription";

// Remove edge runtime for now since we're using Prisma
// export const runtime = 'edge';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription(userId);

    return NextResponse.json({ isPro });
  } catch (error) {
    console.error("[SUBSCRIPTION_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
