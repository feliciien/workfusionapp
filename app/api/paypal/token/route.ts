import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const accessToken = await getPayPalAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("[TOKEN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
