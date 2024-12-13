import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Access the in-memory training sessions (in production, use a database)
declare const trainingSessions: { [key: string]: any };

export async function GET(
  req: Request,
  { params }: { params: { modelId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const modelId = params.modelId;
    const session = trainingSessions[modelId];

    if (!session) {
      return new NextResponse("Training session not found", { status: 404 });
    }

    if (session.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      status: session.status,
      progress: session.progress,
      currentEpoch: session.currentEpoch,
      startTime: session.startTime,
    });

  } catch (error) {
    console.log('[STATUS_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
