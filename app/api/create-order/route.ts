import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { paypal } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { planType, price } = body;

    const order = await paypal.createOrder({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: price.toString()
        },
        description: `SynthAI ${planType} Plan`
      }]
    });

    return NextResponse.json({ orderID: order.id });
  } catch (error) {
    console.error("[CREATE_ORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
