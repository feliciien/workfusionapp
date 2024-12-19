import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      console.error("PayPal client ID missing");
      return new NextResponse(
        JSON.stringify({ error: "PayPal configuration error" }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json({ clientId });
  } catch (error) {
    console.error("[PAYPAL_TOKEN_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
