"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LandingNabvbar } from "@/components/landing-navbar";

interface DocSection {
  title: string;
  id: string;
}

interface Section {
  title: string;
  items: DocSection[];
}

interface DocContent {
  [key: string]: {
    title: string;
    content: string;
  };
}

const sections: Section[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", id: "introduction" },
      { title: "Quick Start", id: "quick-start" },
      { title: "Installation", id: "installation" },
      { title: "Authentication", id: "authentication" },
    ],
  },
  {
    title: "Core Features",
    items: [
      { title: "AI Models", id: "ai-models" },
      { title: "Code Generation", id: "code-generation" },
      { title: "Content Creation", id: "content-creation" },
      { title: "Image Generation", id: "image-generation" },
      { title: "Voice Synthesis", id: "voice-synthesis" },
    ],
  },
  {
    title: "Advanced Usage",
    items: [
      { title: "API Reference", id: "api-reference" },
      { title: "Customization", id: "customization" },
      { title: "Best Practices", id: "best-practices" },
      { title: "Rate Limits", id: "rate-limits" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Examples", id: "examples" },
      { title: "Tutorials", id: "tutorials" },
      { title: "FAQ", id: "faq" },
      { title: "Support", id: "support" },
    ],
  },
];

const DocContent: DocContent = {
  introduction: {
    title: "Introduction to SynthAI",
    content: `SynthAI is a powerful AI platform that combines state-of-the-art models with an intuitive interface to help you create, innovate, and automate. Our platform provides access to advanced AI capabilities including code generation, content creation, image generation, and more.

Key Features:
• Advanced AI Models - Access to GPT-4, DALL-E 3, and custom models
• Code Generation - Create production-ready code with intelligent context understanding
• Content Creation - Generate high-quality content that matches your brand voice
• Image Generation - Transform ideas into stunning visuals
• Voice Synthesis - Create natural-sounding voice content

This documentation will help you understand how to leverage these features effectively.

Getting Support:
• Community Forum - Join our active community
• Discord Channel - Real-time support and discussions
• Email Support - Premium support for enterprise customers
• Documentation - Comprehensive guides and tutorials`,
  },
  "quick-start": {
    title: "Quick Start Guide",
    content: `Getting started with SynthAI is straightforward:

1. Sign Up
   • Visit synthAI.com and click "Sign Up"
   • Choose your plan (Free, Pro, or Enterprise)
   • Complete the registration process

2. API Key
   • Navigate to Settings > API Keys
   • Generate a new API key
   • Store it securely - you'll need it for API requests

3. First Request
   \`\`\`typescript
   const response = await fetch('https://api.synthai.com/v1/generate', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer YOUR_API_KEY',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       prompt: 'Your prompt here',
       model: 'gpt-4',
       max_tokens: 100
     })
   });
   \`\`\`

4. Explore Features
   • Try different AI models
   • Experiment with various prompts
   • Check out our examples and tutorials`,
  },
  installation: {
    title: "Installation",
    content: `Install the SynthAI SDK using your preferred package manager:

npm:
\`\`\`bash
npm install @synthai/sdk
\`\`\`

yarn:
\`\`\`bash
yarn add @synthai/sdk
\`\`\`

pnpm:
\`\`\`bash
pnpm add @synthai/sdk
\`\`\`

Then import and initialize the SDK:

\`\`\`typescript
import { SynthAI } from '@synthai/sdk';

const synthai = new SynthAI({
  apiKey: 'YOUR_API_KEY'
});
\`\`\``,
  },
  authentication: {
    title: "Authentication",
    content: `SynthAI uses API keys for authentication. To obtain your API key:

1. Log in to your SynthAI dashboard
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy and store your key securely

Using your API key:

\`\`\`typescript
// With SDK
const synthai = new SynthAI({
  apiKey: process.env.SYNTHAI_API_KEY
});

// With REST API
const headers = {
  'Authorization': \`Bearer \${process.env.SYNTHAI_API_KEY}\`,
  'Content-Type': 'application/json'
};
\`\`\`

Security Best Practices:
• Never expose your API key in client-side code
• Use environment variables to store keys
• Rotate keys periodically
• Use different keys for development and production`,
  },
  "ai-models": {
    title: "AI Models",
    content: `SynthAI provides access to a variety of state-of-the-art AI models:

1. Language Models
   • GPT-4 - Most advanced language model for complex tasks
   • GPT-3.5 - Fast and efficient for general use
   • Custom Models - Domain-specific models trained on your data

2. Image Models
   • DALL-E 3 - Latest image generation model
   • Stable Diffusion - Open-source alternative
   • Image Editing - Advanced image manipulation

3. Voice Models
   • Text-to-Speech - Natural voice synthesis
   • Voice Cloning - Create custom voice models
   • Speech-to-Text - Accurate transcription

Usage Example:
\`\`\`typescript
// Using GPT-4 for text generation
const completion = await synthai.complete({
  model: 'gpt-4',
  prompt: 'Write a product description for...',
  maxTokens: 200,
  temperature: 0.7
});

// Using DALL-E 3 for image generation
const image = await synthai.generateImage({
  model: 'dall-e-3',
  prompt: 'A futuristic city with...',
  size: '1024x1024',
  quality: 'hd'
});
\`\`\`

Model Selection Guidelines:
• Consider task complexity
• Balance speed vs quality
• Monitor token usage
• Use appropriate temperature settings`,
  },
  "code-generation": {
    title: "Code Generation",
    content: `SynthAI's code generation capabilities help developers write better code faster:

Features:
• Multi-language Support - Generate code in 20+ programming languages
• Context Awareness - Understands project context and requirements
• Documentation - Automatic comment generation
• Testing - Generate unit tests automatically

Example Usage:
\`\`\`typescript
// Generate a React component
const code = await synthai.generateCode({
  language: 'typescript',
  framework: 'react',
  prompt: 'Create a form component with email and password fields',
  includeTests: true
});

// Generate an API endpoint
const apiCode = await synthai.generateCode({
  language: 'python',
  framework: 'fastapi',
  prompt: 'Create a REST API endpoint for user authentication',
  includeSwagger: true
});
\`\`\`

Best Practices:
1. Provide Clear Requirements
   • Be specific about functionality
   • Include edge cases
   • Specify error handling needs

2. Review Generated Code
   • Verify security practices
   • Check for edge cases
   • Ensure proper error handling

3. Customize Output
   • Use style guides
   • Specify naming conventions
   • Include type definitions`,
  },
  "content-creation": {
    title: "Content Creation",
    content: `Create engaging content with SynthAI's content generation capabilities:

Content Types:
• Blog Posts
• Marketing Copy
• Social Media Posts
• Product Descriptions
• Email Templates
• Technical Documentation

Features:
• Brand Voice Matching
• SEO Optimization
• Multi-language Support
• Tone Adjustment
• Format Customization

Example Usage:
\`\`\`typescript
// Generate a blog post
const blogPost = await synthai.generateContent({
  type: 'blog',
  topic: 'AI in Healthcare',
  tone: 'professional',
  wordCount: 1000,
  keywords: ['AI', 'healthcare', 'innovation']
});

// Create social media content
const socialPosts = await synthai.generateContent({
  type: 'social',
  platform: 'twitter',
  campaign: 'Product Launch',
  count: 5,
  hashtags: true
});
\`\`\`

Content Guidelines:
1. Clear Objectives
   • Define target audience
   • Specify content goals
   • Set tone and style

2. Brand Consistency
   • Use brand guidelines
   • Maintain voice
   • Include key messages

3. Content Strategy
   • Plan content calendar
   • Mix content types
   • Track performance`,
  },
  "rate-limits": {
    title: "Rate Limits & Quotas",
    content: `Understanding SynthAI's rate limits and quotas:

Rate Limits by Tier:
• Free Tier
  - 60 requests per minute
  - 1000 requests per day
  - Max 4000 tokens per request

• Pro Tier
  - 120 requests per minute
  - 5000 requests per day
  - Max 8000 tokens per request

• Enterprise Tier
  - Custom limits
  - Dedicated resources
  - Priority processing

Handling Rate Limits:
\`\`\`typescript
try {
  const response = await synthai.generate({
    prompt: 'Your prompt'
  });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
    await delay(1000);
    return retry(operation);
  }
  throw error;
}
\`\`\`

Best Practices:
1. Implement Retries
   • Use exponential backoff
   • Set maximum retries
   • Handle errors gracefully

2. Monitor Usage
   • Track daily usage
   • Set up alerts
   • Optimize requests

3. Request Optimization
   • Batch requests when possible
   • Cache responses
   • Compress payloads`,
  },
  // ... rest of the content remains the same ...
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNabvbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <nav className="space-y-8">
                {filteredSections.map((section) => (
                  <div key={section.title}>
                    <h5 className="font-medium text-gray-900 mb-2">
                      {section.title}
                    </h5>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-gray-600 hover:text-gray-900",
                              activeSection === item.id &&
                                "bg-gray-100 text-gray-900"
                            )}
                            onClick={() => setActiveSection(item.id)}
                          >
                            {item.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-gray max-w-none"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                {DocContent[activeSection]?.title}
              </h1>
              <div className="space-y-4 text-gray-600">
                {DocContent[activeSection]?.content.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
