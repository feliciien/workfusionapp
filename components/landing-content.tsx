"use client";

import { Analytics } from "@vercel/analytics/react";
import Image from "next/image";

import ArticleIcon from "@mui/icons-material/Article";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";

const features = [
  {
    title: "Generate Text Effortlessly",
    description:
      "Leverage our AI to produce high-quality content instantly, saving you time and effort.",
    icon: ArticleIcon,
  },
  {
    title: "Automate Your Workflow",
    description:
      "Let our AI handle repetitive tasks, freeing you to focus on innovation and growth.",
    icon: AutorenewIcon,
  },
  {
    title: "Seamless AI Integration",
    description:
      "Integrate our AI tools into your systems effortlessly, without any technical hurdles.",
    icon: IntegrationInstructionsIcon,
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
                <feature.icon className="text-pink-600" fontSize="large" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-6 rounded-xl bg-white shadow-lg">
              <p className="text-gray-600 mb-4">
                {"\""}This service transformed our business! Highly recommended.{"\""}
              </p>
              <div className="flex items-center">
                <Image
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Alice Smith"
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-bold">Alice Smith</h4>
                  <p className="text-gray-600 text-sm">Founder, Tech Innovators</p>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="p-6 rounded-xl bg-white shadow-lg">
              <p className="text-gray-600 mb-4">
                {"\""}An essential tool that has boosted our productivity tenfold.{"\""}
              </p>
              <div className="flex items-center">
                <Image
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Bob Johnson"
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-bold">Bob Johnson</h4>
                  <p className="text-gray-600 text-sm">CEO, Business Solutions</p>
                </div>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className="p-6 rounded-xl bg-white shadow-lg">
              <p className="text-gray-600 mb-4">
                {"\""}Exceptional service and support. A game-changer for our operations.{"\""}
              </p>
              <div className="flex items-center">
                <Image
                  src="https://randomuser.me/api/portraits/women/65.jpg"
                  alt="Emma Davis"
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="text-gray-900 font-bold">Emma Davis</h4>
                  <p className="text-gray-600 text-sm">CTO, Innovate LLC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Analytics />
    </div>
  );
};

export default LandingContent;
