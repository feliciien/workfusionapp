import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/jwt";
import { db } from "@/lib/db";

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image
    });
  } catch (error) {
    console.error("[USER_ERROR]", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
