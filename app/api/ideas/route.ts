// app/api/ideas/route.ts

import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { headers } from "next/headers";
import { FEATURE_TYPES } from "@/constants";

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Maximum allowed duration for hobby plan

const formatIdeas = (content: string): string[] => {
  try {
    const ideas = JSON.parse(content);
    if (Array.isArray(ideas)) {
      return ideas;
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
  }

  // Fallback: split by newlines and clean up
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
};

export async function POST(req: Request) {
  try {
    // Initialize headers first
    headers();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    const { topic } = await req.json();
    console.log("Received topic:", topic);

    if (!topic || typeof topic !== "string") {
      return new NextResponse("Topic is required and must be a string", { status: 400 });
    }

    if (topic.length > 1000) {
      return new NextResponse("Topic is too long. Maximum length is 1000 characters", { status: 400 });
    }

    const hasAvailableUsage = await checkFeatureLimit(FEATURE_TYPES.IDEA_GENERATOR);
    const isPro = await checkSubscription();

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
          content: `You are a creative idea generator. Generate 5-10 innovative and practical ideas related to the given topic.
          Each idea should be:
          1. Unique and creative
          2. Practical and actionable
          3. Well-explained in 1-2 sentences
          
          Return ONLY a JSON array of strings, with each string being a complete idea.
          Example format: ["Create a mobile app that helps users track their daily water intake and reminds them to stay hydrated", "Develop a community garden program where neighbors can share gardening tips and trade produce"]
          
          DO NOT include any other text or formatting, just the JSON array.`
        },
        {
          role: "user",
          content: topic
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    console.log("Raw OpenAI response:", response.choices[0].message.content);

    const ideas = formatIdeas(response.choices[0].message.content);
    console.log("Formatted ideas:", ideas);

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.IDEA_GENERATOR);
    }

    return NextResponse.json({
      status: "success",
      data: {
        ideas: ideas
      }
    });

  } catch (error: any) {
    console.error("[IDEAS_ERROR]", error);
    return NextResponse.json({
      status: "error",
      message: error?.message || "Internal Server Error"
    }, { status: 500 });
  }
}
