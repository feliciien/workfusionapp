// app/api/user/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
