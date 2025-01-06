import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription(session.user.id);

    return NextResponse.json({ isPro });
  } catch (error) {
    console.error("[SUBSCRIPTION_CHECK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
