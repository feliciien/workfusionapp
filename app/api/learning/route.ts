import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { checkFeatureLimit, increaseFeatureUsage } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LEARNING_PROMPTS = {
  flashcards: "Create study flashcards with questions on one side and answers on the other. Format each flashcard as Q: [question] A: [answer]",
  summary: "Create a concise summary of the key concepts and main points. Use bullet points and clear headings.",
  quiz: "Create a quiz with multiple-choice questions and explanations for the answers. Format as Q1: [question] Options: [a,b,c,d] Answer: [correct option] Explanation: [why]",
  mindmap: "Create a text-based mind map showing the relationships between key concepts. Use indentation and bullet points to show hierarchy.",
  timeline: "Create a chronological timeline of important events and developments. Format as [date/period]: [event/development]"
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { content, learningType = 'summary', messages } = body;

    if (!content && !messages) {
      return new NextResponse("Content or messages are required", { status: 400 });
    }

    const freeTrial = await checkFeatureLimit(userId, FEATURE_TYPES.STUDY);
    const isPro = await checkSubscription(userId);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    let response;
    if (messages) {
      response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages.map((msg: any) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1000,
      });
    } else {
      const prompt = `${LEARNING_PROMPTS[learningType as keyof typeof LEARNING_PROMPTS]}\n\nContent: ${content}`;
      response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
    }

    if (!isPro) {
      await increaseFeatureUsage(userId, FEATURE_TYPES.STUDY);
    }

    return NextResponse.json({ content: response.choices[0].message.content });
  } catch (error) {
    console.log("[LEARNING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
