import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { checkSubscription } from "@/lib/subscription";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPro = await checkSubscription();

    return NextResponse.json({ isPro });
  } catch (error) {
    console.error("[SUBSCRIPTION_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
