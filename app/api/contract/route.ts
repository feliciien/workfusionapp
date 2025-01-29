/** @format */

import { FEATURE_TYPES } from "@/constants";
import { authOptions } from "@/lib/auth-options";
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { contractType, party1Name, party2Name, requirements } = body;

    if (!contractType || !party1Name || !party2Name || !requirements) {
      return new NextResponse("Missing required contract information", {
        status: 400
      });
    }

    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.CONTRACT_GENERATOR),
      checkSubscription()
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        "Free usage limit reached. Please upgrade to pro for unlimited access.",
        { status: 403 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a legal contract generator. Generate a professional and legally compliant contract based on the provided requirements. Include all necessary sections, clauses, and legal terminology. Format the output in a clean, professional layout with proper sections and numbering."
        },
        {
          role: "user",
          content: `Generate a ${contractType} contract between ${party1Name} and ${party2Name} with the following requirements:\n\n${requirements}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.CONTRACT_GENERATOR);
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONTRACT_GENERATOR_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
