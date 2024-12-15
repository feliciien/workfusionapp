import { NextResponse } from "next/server";
import OpenAI from 'openai';
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;

interface Slide {
  type: 'title' | 'intro' | 'content' | 'conclusion';
  title: string;
  content: string | string[];
}

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
  // Ensure content is always an array for non-title slides
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
    console.log('Formatting slides from content:', content);
    const parsed = JSON.parse(content);
    
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.error('Invalid slides format:', parsed);
      throw new Error("Invalid slides format");
    }
    
    const transformedSlides = parsed.slides
      .map(transformSlideType)
      .filter(validateSlide);

    if (transformedSlides.length === 0) {
      throw new Error("No valid slides generated");
    }

    console.log('Transformed slides:', transformedSlides);
    return transformedSlides;
  } catch (error) {
    console.error("Failed to parse slides:", error);
    // Fallback format for error cases
    return [
      {
        type: 'title',
        title: 'Error in Presentation Generation',
        content: 'Failed to generate presentation slides. Please try again.'
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
      // Continue with free trial if there's an error checking limits
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
          content: `You are a presentation expert. Create a comprehensive presentation outline with multiple slides for the given topic.
          
          Required Slide Structure (7-10 slides total):
          1. Title Slide: Engaging main title and subtitle
          2. Introduction (1-2 slides): 
             - Overview of the topic
             - Key points to be covered
             - Why this topic matters
          3. Main Content (4-6 slides):
             - Each slide should focus on one main point
             - Include supporting details, examples, or statistics
             - Use clear, actionable bullet points
          4. Conclusion (1-2 slides):
             - Summary of key takeaways
             - Call to action or next steps
             - Final thoughts
          
          Guidelines:
          - Each slide must have a clear purpose and flow logically
          - Keep titles concise but descriptive (5-8 words)
          - Bullet points should be complete sentences
          - Include relevant examples, statistics, or case studies
          - Maintain consistent tone and style
          
          Format your response as JSON with this exact structure:
          {
            "slides": [
              {
                "type": "title",
                "title": "Main Title",
                "content": "Subtitle that explains the value proposition"
              },
              {
                "type": "intro",
                "title": "Introduction",
                "content": ["Point 1", "Point 2", "Point 3", "Point 4"]
              },
              {
                "type": "content",
                "title": "Main Point Title",
                "content": ["Detailed point 1", "Supporting example", "Statistical evidence", "Action item"]
              },
              {
                "type": "conclusion",
                "title": "Key Takeaways",
                "content": ["Summary point 1", "Summary point 2", "Call to action", "Next steps"]
              }
            ]
          }
          
          Requirements:
          1. Generate AT LEAST 7 slides, including title and conclusion
          2. Each content slide must have 3-4 detailed bullet points
          3. Use specific examples and data points
          4. Ensure all content is factual and well-structured
          5. Return ONLY valid JSON, no additional text`
        },
        {
          role: "user",
          content: topic
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0.1,
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

    // Only try to increase API limit if we successfully checked it
    if (!isPro) {
      try {
        await increaseApiLimit();
      } catch (error) {
        console.error("Error increasing API limit:", error);
        // Continue anyway since we've already generated the content
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
        error: "Database connection error. Please try again."
      }, { status: 500 });
    }
    if (error.code === "P2003") {
      return new NextResponse("User authentication error. Please try logging out and back in.", { status: 401 });
    }
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
