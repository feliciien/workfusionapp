import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a code analysis expert. Analyze the following code and provide:
          1. A code quality score out of 100
          2. A list of potential issues with severity levels
          3. Suggestions for improvement
          Format your response as JSON with the following structure:
          {
            "score": number,
            "issues": [{ "severity": "high|medium|low", "message": "string", "line": number }],
            "suggestions": ["string"]
          }`
        },
        {
          role: "user",
          content: code
        }
      ],
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      data: JSON.parse(response.choices[0].message.content || "{}")
    });
  } catch (error: any) {
    console.error("[CODE_ANALYSIS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
