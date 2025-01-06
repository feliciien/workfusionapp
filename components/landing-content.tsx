"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah",
    avatar: "/testimonials/sarah.jpg",
    title: "Software Developer",
    description: "This AI tool has revolutionized my workflow. The code suggestions are incredibly accurate and helpful.",
    rating: 5,
    companyLogo: "/companies/fpi.svg"
  },
  {
    name: "Michael",
    avatar: "/testimonials/michael.jpg",
    title: "Product Manager",
    description: "An indispensable tool for our team. It has significantly improved our development speed and code quality.",
    rating: 5,
    companyLogo: "/companies/techcorp.svg"
  },
  {
    name: "Emily",
    avatar: "/testimonials/emily.jpg",
    title: "Tech Lead",
    description: "The AI assistance is remarkable. It understands context and provides relevant suggestions consistently.",
    rating: 5,
    companyLogo: "/companies/innovai.svg"
  }
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
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold text-gray-900 mb-4">
            Loved by Industry Leaders
          </h2>
          <p className="text-center text-xl text-gray-600 max-w-2xl mx-auto mb-16">
            Join thousands of professionals who are revolutionizing their work with our AI platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((item) => (
              <Card key={item.description} className="group hover:scale-105 transition-all duration-300 border-none shadow-lg hover:shadow-xl bg-white">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100">
                      <Image
                        src={item.avatar}
                        alt="Avatar"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-5 h-5 relative ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Image
                          src="/star.svg"
                          alt="Star rating"
                          width={20}
                          height={20}
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed italic">
                    &ldquo;{item.description}&rdquo;
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                      <Image
                        src={item.companyLogo}
                        alt="Company Logo"
                        width={96}
                        height={32}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingContent;