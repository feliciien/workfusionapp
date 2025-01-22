import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

// Access the in-memory training sessions (in production, use a database)
declare const trainingSessions: { [key: string]: any };

export async function GET(
  req: Request,
  { params }: { params: { modelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const modelId = params.modelId;
    const sessionData = trainingSessions[modelId];

    if (!sessionData) {
      return new NextResponse("Training session not found", { status: 404 });
    }

    if (sessionData.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      status: sessionData.status,
      progress: sessionData.progress,
      currentEpoch: sessionData.currentEpoch,
      startTime: sessionData.startTime,
    });

  } catch (error) {
    console.log("[STATUS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
