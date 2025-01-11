export const dynamic = "force-dynamic";

import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = session?.user;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Split the user's name into first and last name if available
    const [firstName = "", ...lastNameParts] = user.name?.split(" ") || [];
    const lastName = lastNameParts.join(" ");

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("[USER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
