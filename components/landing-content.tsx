"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Analytics } from "@vercel/analytics/react";

const testimonials = [
  {
    name: "Franck",
    title: "Software Engineer",
    description: "The AI code generation has transformed my workflow. I can prototype and build applications in a fraction of the time, with consistently high-quality output.",
    rating: 5,
    avatar: "F"
  },
  {
    name: "Marie",
    title: "AI Researcher",
    description: "As an AI expert, I'm impressed by the advanced capabilities and accuracy. The platform stays current with the latest AI developments and provides enterprise-grade results.",
    rating: 5,
    avatar: "M"
  },
  {
    name: "Andrew",
    title: "Content Creator",
    description: "The creative AI tools are game-changing. From writing to image generation, it helps me produce engaging content that resonates with my audience.",
    rating: 5,
    avatar: "A"
  },
  {
    name: "Sarah",
    title: "Product Manager",
    description: "This platform has streamlined our entire product development process. The AI insights and automation tools have significantly boosted our team's productivity.",
    rating: 5,
    avatar: "S"
  },
];

const features = [
  {
    title: "Advanced AI Models",
    description: "Access state-of-the-art AI models for various tasks including GPT-4, DALL-E 3, and custom-trained models.",
    icon: "smart_toy"
  },
  {
    title: "Code Generation",
    description: "Generate production-ready code in multiple languages with intelligent context understanding and best practices.",
    icon: "code"
  },
  {
    title: "Content Creation",
    description: "Create high-quality content, from blog posts to marketing copy, with AI that understands your brand voice.",
    icon: "edit_note"
  },
  {
    title: "Image Generation",
    description: "Transform ideas into stunning visuals with advanced image generation and editing capabilities.",
    icon: "image"
  }
];

const stats = [
  { value: "10M+", label: "Generated Assets" },
  { value: "99.9%", label: "Uptime" },
  { value: "10k+", label: "Active Users" },
  { value: "150+", label: "AI Models" }
];

export const LandingContent = () => {
  return (
    <div className="px-8 pb-20">
      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
          Powerful AI Features
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Unlock the full potential of AI with our comprehensive suite of tools and features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <span className="material-icons-outlined text-pink-600">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="mb-20 py-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
          Trusted by Industry Leaders
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          See how professionals across different industries are leveraging our AI platform to transform their work
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((item) => (
            <Card key={item.description} className="border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-col items-start pb-2">
                <div className="flex items-center gap-x-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="material-icons-outlined text-yellow-400">star</span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 leading-relaxed">
                  &ldquo;{item.description}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <Analytics />
    </div>
  );
};

export default LandingContent;