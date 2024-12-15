import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return NextResponse.json({
      data: {
        response: response.choices[0].message.content
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during chat completion." },
      { status: 500 }
    );
  }
}
