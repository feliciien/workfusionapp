import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 300; // 5 minutes timeout

interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

const transformSlideType = (slide: any): Slide => {
  return {
    ...slide,
    type: slide.type === 'main' ? 'content' : slide.type
  };
};

const formatSlides = (content: string): Slide[] => {
  try {
    console.log('Formatting slides from content:', content);
    const parsed = JSON.parse(content);
    
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.error('Invalid slides format:', parsed);
      throw new Error("Invalid slides format");
    }
    
    const transformedSlides = parsed.slides.map(transformSlideType);
    console.log('Transformed slides:', transformedSlides);
    return transformedSlides;
  } catch (error) {
    console.error("Failed to parse slides:", error);
    const lines = content.split('\n').filter(line => line.trim());
    return [
      {
        type: 'title',
        title: lines[0] || 'Presentation',
        content: 'Generated presentation'
      },
      {
        type: 'content',
        title: 'Main Points',
        content: lines.slice(1).map(line => line.replace(/^[•\-*]\s*/, ''))
      }
    ];
  }
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API key not configured", { status: 500 });
    }

    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return new NextResponse("Topic is required and must be a string", { status: 400 });
    }

    if (topic.length > 1000) {
      return new NextResponse("Topic is too long. Maximum length is 1000 characters", { status: 400 });
    }

    let freeTrial = true;
    let isPro = false;

    try {
      freeTrial = await checkApiLimit();
      isPro = await checkSubscription();
    } catch (error) {
      console.error("Error checking API limits:", error);
      freeTrial = true;
      isPro = false;
    }

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a presentation expert. Create a professional presentation outline for the given topic.
          Include:
          1. A title slide
          2. An introduction
          3. Several content slides (3-5)
          4. A conclusion
          
          Format your response as JSON with the following structure:
          {
            "slides": [
              {
                "type": "title",
                "title": "Main Title",
                "content": "Subtitle or brief description"
              },
              {
                "type": "intro",
                "title": "Introduction",
                "content": ["Point 1", "Point 2", "Point 3"]
              },
              {
                "type": "content",
                "title": "Section Title",
                "content": ["Point 1", "Point 2", "Point 3"]
              },
              {
                "type": "conclusion",
                "title": "Conclusion",
                "content": ["Summary Point 1", "Summary Point 2", "Call to Action"]
              }
            ]
          }
          
          Note: Slide types MUST be one of: "title", "intro", "content", or "conclusion".
          Make sure to return ONLY valid JSON, no additional text.`
        },
        {
          role: "user",
          content: topic
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    console.log("Raw OpenAI response:", response.choices[0].message.content);

    const slides = formatSlides(response.choices[0].message.content);
    console.log("Formatted slides:", slides);

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      throw new Error("Failed to generate valid slides");
    }

    if (!isPro) {
      try {
        await increaseApiLimit();
      } catch (error) {
        console.error("Error increasing API limit:", error);
      }
    }

    return NextResponse.json({
      data: {
        slides
      }
    });

  } catch (error: any) {
    console.error("[PRESENTATION_ERROR]", error);
    if (error.code === "P2024") {
      return NextResponse.json({
        data: {
          slides: []
        },
        error: "Database connection error. Please try again."
      }, { status: 500 });
    }
    if (error.code === "P2003") {
      return new NextResponse("User authentication error. Please try logging out and back in.", { status: 401 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
