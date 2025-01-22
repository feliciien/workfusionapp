import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseFeatureUsage, checkFeatureLimit } from "@/lib/api-limit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { code, task } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    const freeTrial = await checkFeatureLimit("code");
    if (!freeTrial) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert code optimizer focusing on performance, readability, and best practices. Analyze the code and provide specific improvements."
        },
        {
          role: "user",
          content: `
Task: ${task || 'Optimize and improve the following code'}
Code:
\`\`\`
${code}
\`\`\`

Please provide:
1. Optimized code
2. List of improvements made
3. Performance impact analysis
4. Best practices implemented
`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    await increaseFeatureUsage("code");

    return NextResponse.json(response.choices[0].message);

  } catch (error) {
    console.error("[O1_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
