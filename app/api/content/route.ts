import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer. Generate high-quality, engaging content based on the given prompt."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return NextResponse.json({
      data: {
        content: response.choices[0].message.content
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during content generation." },
      { status: 500 }
    );
  }
}
