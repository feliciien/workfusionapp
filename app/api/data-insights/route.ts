import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
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
          content: `You are a data analysis expert. Analyze the following data and provide:
          1. Key metrics and their values
          2. Notable trends
          3. Actionable recommendations
          Format your response as JSON with the following structure:
          {
            "metrics": { [key: string]: number | string },
            "trends": ["string"],
            "recommendations": ["string"]
          }`
        },
        {
          role: "user",
          content: JSON.stringify(data)
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
    console.error("[DATA_INSIGHTS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
