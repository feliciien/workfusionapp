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

    const apiLimitData = await getApiLimitCount();

    return NextResponse.json(apiLimitData);
  } catch (error) {
    console.error("[API_LIMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
