"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const proFeatures = [
  "Unlimited Access",
  "Premium Features",
  "Priority Processing",
  "Early Access",
  "Priority Support",
];

const proOnlyTools = [
  {
    name: "Video Generation",
    description: "Create videos from text descriptions.",
  },
  {
    name: "Music Creation",
    description: "Generate original music and melodies.",
  },
  {
    name: "Art Studio",
    description: "Create digital art with AI assistance.",
  },
  {
    name: "Translation",
    description: "Translate text between languages.",
  },
  {
    name: "Data Insights",
    description: "Generate insights from your data.",
  },
  {
    name: "Network Analysis",
    description: "Analyze and visualize network data.",
  },
  {
    name: "Study Assistant",
    description: "AI-powered study and learning assistance.",
  },
  {
    name: "Research Assistant",
    description: "AI-powered research assistance.",
  },
];

const unlimitedTools = [
  {
    name: "Image Generation",
    limit: "free / Unlimited with Pro",
    description: "Generate stunning images from text descriptions.",
  },
  {
    name: "Code Assistant",
    limit: "free / Unlimited with Pro",
    description: "Generate code and get programming help.",
  },
  {
    name: "Voice Synthesis",
    limit: "free / Unlimited with Pro",
    description: "Convert text to natural-sounding speech.",
  },
  {
    name: "Content Writer",
    limit: "1000 free / Unlimited with Pro",
    description: "Generate articles, blogs, and marketing copy.",
  },
  {
    name: "Presentation",
    limit: "5 free / Unlimited with Pro",
    description: "Create professional presentations.",
  },
  {
    name: "Idea Generator",
    limit: "5 free / Unlimited with Pro",
    description: "Generate creative ideas and solutions.",
  },
];

interface PricePlan {
  amount: number;
  period: string;
  savings?: string;
}

interface Prices {
  monthly: PricePlan;
  yearly: PricePlan;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [isYearly, setIsYearly] = useState(false);

  const prices: Prices = {
    monthly: {
      amount: 10,
      period: "month",
    },
    yearly: {
      amount: 100,
      period: "year",
      savings: "Save $20 (17% off)",
    },
  };

  const currentPlan = isYearly ? prices.yearly : prices.monthly;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Choose the perfect plan for your needs
          </h1>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={!isYearly ? "font-semibold" : "text-gray-600"}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={isYearly ? "font-semibold" : "text-gray-600"}>
              Yearly
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 mb-16">
          <Card className="p-8 relative overflow-hidden">
            {isYearly && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600">
                BEST VALUE
              </Badge>
            )}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">
                {isYearly ? "Yearly" : "Monthly"} Pro
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">${currentPlan.amount}</span>
                <span className="text-gray-600">/{currentPlan.period}</span>
              </div>
              {isYearly && currentPlan.savings && (
                <p className="text-green-600 font-medium mt-2">
                  {currentPlan.savings}
                </p>
              )}
              <p className="text-purple-600 font-medium mt-4">
                Everything you need to create amazing AI content
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="font-semibold">Pro Features:</h4>
              <ul className="space-y-3">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="font-semibold">Pro-Only Tools:</h4>
              <ul className="space-y-3">
                {proOnlyTools.map((tool) => (
                  <li key={tool.name} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{tool.name}</span>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Unlimited Access:</h4>
              <ul className="space-y-3">
                {unlimitedTools.map((tool) => (
                  <li key={tool.name} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{tool.name}</span>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                      <p className="text-xs text-purple-600 mt-1">{tool.limit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              {isAuthenticated ? (
                <Link href="/settings">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Upgrade to Pro
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
