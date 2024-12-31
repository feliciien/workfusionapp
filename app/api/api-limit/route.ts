import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getApiLimitCount } from "@/lib/api-limit";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiLimitCount = await getApiLimitCount();

    return new NextResponse(JSON.stringify(apiLimitCount));
  } catch (error) {
    console.log("[API_LIMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
