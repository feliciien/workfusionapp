import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for training status (in production, use a database)
const trainingSessions: { [key: string]: any } = {};

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const parameters = JSON.parse(formData.get("parameters") as string);
    const files = formData.getAll("trainingData") as File[];

    if (!name || !type || !description || !files.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate a unique ID for this training session
    const modelId = uuidv4();

    // Initialize training session
    trainingSessions[modelId] = {
      userId,
      name,
      type,
      description,
      parameters,
      status: "preparing",
      progress: 0,
      startTime: new Date().toISOString(),
    };

    // Start training process (simulated for now)
    simulateTraining(modelId);

    return NextResponse.json({ 
      modelId,
      message: "Training started successfully" 
    });

  } catch (error) {
    console.log('[CUSTOM_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Simulated training process (replace with actual ML training in production)
async function simulateTraining(modelId: string) {
  const totalSteps = 100;
  const session = trainingSessions[modelId];
  
  for (let step = 0; step <= totalSteps; step++) {
    if (!trainingSessions[modelId]) break; // Handle cancelled training

    trainingSessions[modelId] = {
      ...session,
      status: step === totalSteps ? "completed" : "training",
      progress: Math.round((step / totalSteps) * 100),
      currentEpoch: Math.floor((step / totalSteps) * session.parameters.epochs),
    };

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
