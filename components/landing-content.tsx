"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Analytics } from "@vercel/analytics/react";
import Image from "next/image";

const features = [
  {
    title: "Generate Text in Seconds",
    description:
      "Quickly produce high-quality content for blogs, social media, and marketing materials with our AI-powered text generation.",
    icon: "flash_on",
  },
  {
    title: "Automate Repetitive Tasks",
    description:
      "Streamline your workflow by letting our AI handle mundane tasks, giving you more time to focus on what matters.",
    icon: "autorenew",
  },
  {
    title: "Seamless Integration",
    description:
      "Easily integrate our AI tools into your existing systems and processes without any hassle.",
    icon: "integration_instructions",
  },
];

const stats = [
  { value: "10M+", label: "Generated Assets" },
  { value: "99.9%", label: "Uptime" },
  { value: "10k+", label: "Active Users" },
  { value: "150+", label: "AI Models" },
];

export const LandingContent = () => {
  return (
    <div className="px-8 pb-20">
      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
          Key Features to Boost Your Productivity
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Discover how our AI tools can transform your workflow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <span className="material-icons-outlined text-pink-600">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
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
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {stat.value}
              </div>
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
            Join thousands of professionals who are revolutionizing their work
            with our AI platform
          </p>

          {/* Testimonials would go here */}
        </div>
      </section>
      <Analytics />
    </div>
  );
};

export default LandingContent;
