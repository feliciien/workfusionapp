import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      console.error("PayPal client ID not configured");
      return new NextResponse("PayPal configuration error", { status: 500 });
    }

    return NextResponse.json({ clientId });
  } catch (error) {
    console.error("[PAYPAL_CLIENT_TOKEN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
