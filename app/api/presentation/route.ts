import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import OpenAI from 'openai';

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
    const { prompt, template, numSlides } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const isPro = await checkSubscription(userId);
    const canGenerate = await checkFeatureLimit(userId, FEATURE_TYPES.PRESENTATION);
    
    if (!isPro && !canGenerate) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a presentation expert. Create a detailed presentation outline based on the user's prompt. 
          Format the response as a JSON array where each object represents a slide with the following structure:
          {
            "title": "Slide title",
            "content": ["Point 1", "Point 2", "Point 3"],
            "notes": "Speaker notes for this slide"
          }
          The presentation should be professional, well-structured, and engaging.
          ${template ? `Use the ${template} style for the presentation.` : ''}
          ${numSlides ? `Create exactly ${numSlides} slides.` : 'Create an appropriate number of slides (usually 5-10).'}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const slides = JSON.parse(response.choices[0].message.content || "[]");

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.PRESENTATION);
    }

    return NextResponse.json(slides);
  } catch (error) {
    console.error("[PRESENTATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
