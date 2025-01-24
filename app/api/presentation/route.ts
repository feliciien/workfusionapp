import { NextResponse } from "next/server";
export const runtime = 'nodejs';

import OpenAI from 'openai';
import { checkFeatureLimit, incrementFeatureUsage } from "@/lib/feature-limit";
import { checkSubscription } from "@/lib/subscription";
import { FEATURE_TYPES } from "@/constants";
import * as mammoth from 'mammoth';
import { Buffer, Blob } from 'buffer';

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
  minimal: `Create a concise presentation focusing on essential points only. Use short, impactful statements and minimal text per slide.`,
  modern: `Develop a sleek and contemporary presentation with clean lines, modern typography, and a focus on visuals over text.`,
  illustrative: `Design a presentation rich in visuals and illustrations to convey concepts artistically. Use images and graphics to enhance understanding.`,
  corporate: `Craft a professional corporate presentation emphasizing company values, mission statements, and strategic goals. Maintain a formal tone throughout.`,
};

const COLOR_SCHEME_PROMPTS = {
  default: `Use a standard color scheme appropriate for the content.`,
  light: `Incorporate light and airy colors to create a fresh and open feel.`,
  dark: `Utilize dark and bold colors to create a strong and impactful presentation.`,
  colorful: `Apply vibrant and diverse colors to make the presentation lively and engaging.`,
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
  const content =
    slide.type === 'title'
      ? typeof slide.content === 'string'
        ? slide.content
        : slide.content.join(' ')
      : Array.isArray(slide.content)
      ? slide.content
      : [slide.content];

  return {
    type: slide.type === 'main' ? 'content' : slide.type,
    title: slide.title,
    content: content,
  };
};

const formatSlides = (content: string): Slide[] => {
  try {
    // Clean the response content by removing markdown code block syntax
    const cleanedContent = content.replace(/^```json\n|```$/g, '').trim();
    console.log('Cleaned OpenAI response:', cleanedContent);

    const parsed = JSON.parse(cleanedContent);

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.error('Invalid slides format:', parsed);
      throw new Error('Invalid slides format');
    }

    const formattedSlides = parsed.slides
      .filter(validateSlide)
      .map(transformSlideType);

    console.log('Formatted slides:', formattedSlides);
    return formattedSlides;
  } catch (error) {
    console.error('Error formatting slides:', error);
    throw new Error('Failed to format slides');
  }
};

export async function POST(req: Request) {
  try {
    const [hasAvailableUsage, isPro] = await Promise.all([
      checkFeatureLimit(FEATURE_TYPES.PRESENTATION),
      checkSubscription(),
    ]);

    if (!hasAvailableUsage && !isPro) {
      return new NextResponse(
        'Free usage limit reached. Please upgrade to pro for unlimited access.',
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let template = 'business';
    let colorScheme = 'default';
    let documentText = '';

    if (contentType.includes('multipart/form-data')) {
      // Handle form data (file upload)
      const formData = await req.formData();

      const file = formData.get('file');

      const templateField = formData.get('template');
      if (templateField && typeof templateField === 'string') {
        template = templateField;
      }

      const colorSchemeField = formData.get('colorScheme');
      if (colorSchemeField && typeof colorSchemeField === 'string') {
        colorScheme = colorSchemeField;
      }

      if (!file || !(file instanceof Blob)) {
        return new NextResponse('No file uploaded', { status: 400 });
      }

      const arrayBuffer = await (file as Blob).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Convert Word document to text
      const result = await mammoth.extractRawText({ buffer });
      documentText = result.value;

      if (!documentText || documentText.trim().length === 0) {
        return new NextResponse('Uploaded document is empty', { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON input
      const { topic, template: templateFromBody, colorScheme: colorSchemeFromBody } = await req.json();

      if (!topic) {
        return new NextResponse('Topic is required', { status: 400 });
      }

      if (templateFromBody && typeof templateFromBody === 'string') {
        template = templateFromBody;
      }

      if (colorSchemeFromBody && typeof colorSchemeFromBody === 'string') {
        colorScheme = colorSchemeFromBody;
      }

      documentText = topic;
    } else {
      return new NextResponse('Invalid Content-Type', { status: 400 });
    }

    if (!TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS]) {
      return new NextResponse('Invalid template', { status: 400 });
    }

    if (!COLOR_SCHEME_PROMPTS[colorScheme as keyof typeof COLOR_SCHEME_PROMPTS]) {
      return new NextResponse('Invalid color scheme', { status: 400 });
    }

    const templatePrompt = TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS];
    const colorSchemePrompt = COLOR_SCHEME_PROMPTS[colorScheme as keyof typeof COLOR_SCHEME_PROMPTS];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use a fast and capable model
      messages: [
        {
          role: 'system',
          content: `You are a professional presentation creator. ${templatePrompt} ${colorSchemePrompt}
Analyze the provided content and create a presentation based on it.
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
}`,
        },
        {
          role: 'user',
          content: `Create a presentation based on the following content:\n\n${documentText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    if (!response.choices[0].message?.content) {
      throw new Error('Failed to generate presentation content');
    }

    const slides = formatSlides(response.choices[0].message.content);

    if (!slides || slides.length === 0) {
      throw new Error('No valid slides generated');
    }

    if (!isPro) {
      await incrementFeatureUsage(FEATURE_TYPES.PRESENTATION);
    }

    // Return slides directly in the expected format
    return NextResponse.json({
      slides: slides,
    });
  } catch (error) {
    console.error('[PRESENTATION_ERROR]', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal Error',
      },
      { status: 500 }
    );
  }
}
