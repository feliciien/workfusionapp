import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { paypalApi } from "@/lib/paypal";

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const accessToken = await paypalApi.getPayPalAccessToken();

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("[PAYPAL_TOKEN]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
