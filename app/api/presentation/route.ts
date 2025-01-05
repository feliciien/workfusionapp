import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { getSessionFromRequest } from "@/lib/jwt";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Set to maximum allowed for hobby plan

interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

const TEMPLATE_PROMPTS = {
  business: `Create a professional business presentation with clear value propositions and actionable insights. Focus on ROI, market analysis, and strategic recommendations.`,
  educational: `Create an educational presentation with clear learning objectives, step-by-step explanations, and review sections. Include examples and key takeaways.`,
  creative: `Create an engaging and dynamic presentation with storytelling elements, creative analogies, and thought-provoking content. Make it visually descriptive.`,
  minimal: `Create a concise presentation focusing on essential points only. Use short, impactful statements and minimal text per slide.`
};

const validateSlide = (slide: any): slide is Slide => {
  return (
    slide &&
    typeof slide === 'object' &&
    ['title', 'intro', 'content', 'conclusion'].includes(slide.type) &&
    typeof slide.title === 'string' &&
    (typeof slide.content === 'string' || Array.isArray(slide.content))
  );
};

const transformSlideType = (slide: any): Slide => {
  const content = slide.type === 'title'
    ? (typeof slide.content === 'string' ? slide.content : slide.content.join(' '))
    : (Array.isArray(slide.content) ? slide.content : [slide.content]);

  return {
    type: slide.type === 'main' ? 'content' : slide.type,
    title: slide.title,
    content: content
  };
};

const formatSlides = (content: string): Slide[] => {
  try {
    // Clean the response content by removing markdown code block syntax
    const cleanedContent = content.replace(/^```json\n|\n```$/g, '').trim();
    console.log('Cleaned OpenAI response:', cleanedContent);
    
    const parsed = JSON.parse(cleanedContent);
    
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.error('Invalid slides format:', parsed);
      throw new Error("Invalid slides format");
    }
    
    const formattedSlides = parsed.slides
      .filter(validateSlide)
      .map(transformSlideType);

    console.log('Formatted slides:', formattedSlides);
    return formattedSlides;
  } catch (error) {
    console.error('Error formatting slides:', error);
    throw new Error("Failed to format slides");
  }
};

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { topic, template = 'business' } = await req.json();

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription(userId);

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    if (!topic) {
      return new NextResponse("Topic is required", { status: 400 });
    }

    if (!TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS]) {
      return new NextResponse("Invalid template", { status: 400 });
    }

    const templatePrompt = TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Use a faster model
      messages: [
        {
          role: "system",
          content: `You are a professional presentation creator. ${templatePrompt} 
          Format the response as a JSON object with a 'slides' array. Each slide should have:
          - type: 'title' | 'intro' | 'content' | 'conclusion'
          - title: string
          - content: string for title slides, string[] for other slides
          Include 5-8 slides with a good flow.
          
          Example format:
          {
            "slides": [
              {
                "type": "title",
                "title": "Main Title",
                "content": "Subtitle or description"
              },
              {
                "type": "intro",
                "title": "Introduction",
                "content": ["Key Point 1", "Key Point 2"]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Create a presentation about: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    if (!response.choices[0].message.content) {
      throw new Error("Failed to generate presentation content");
    }

    const slides = formatSlides(response.choices[0].message.content);

    if (!slides || slides.length === 0) {
      throw new Error("No valid slides generated");
    }

    if (!isPro) {
      await increaseApiLimit(userId);
    }

    // Return slides directly in the expected format
    return NextResponse.json({
      slides: slides
    });

  } catch (error) {
    console.error('[PRESENTATION_ERROR]', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal Error'
    }, { status: 500 });
  }
}
