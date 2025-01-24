// Import necessary packages
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!openai.apiKey) {
  throw new Error('Missing OpenAI API Key');
}

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || searchParams.get('category');

    if (!subject || subject.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      );
    }

    const prompt = `
Generate 5 multiple-choice quiz questions on the topic of "${subject}".
Provide the response in JSON format as an array of questions like this:

[
  {
    "question": "Question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Correct option"
  },
  ...
]
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      console.error('OpenAI response is empty');
      return NextResponse.json(
        { success: false, error: 'Failed to generate quiz questions' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse quiz questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
};
