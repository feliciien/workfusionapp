import { NextResponse } from "next/server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLang}. Only respond with the translation, nothing else.`
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    return NextResponse.json({
      data: {
        translation: response.choices[0].message.content
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred during translation." },
      { status: 500 }
    );
  }
}
