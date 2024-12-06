"use client";

import {
  ArrowRight,
  Code,
  ImageIcon,
  MessageSquare,
  Music,
  VideoIcon,
  Mic2,
  Palette,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";

const tools = [
  {
    label: "Conversation",
    description: "Chat seamlessly with our AI assistant to brainstorm ideas.",
    icon: MessageSquare,
    href: "/conversation",
  },
  {
    label: "Image Generation",
    description: "Create unique images and illustrations from your prompts.",
    icon: ImageIcon,
    href: "/image",
  },
  {
    label: "Code Generation",
    description: "Generate code snippets, functions, or entire modules.",
    icon: Code,
    href: "/code",
  },
  {
    label: "Music Synthesis",
    description: "Produce custom audio tracks suited for your projects.",
    icon: Music,
    href: "/music",
  },
  {
    label: "Video Creation",
    description: "Convert text-based ideas into short, AI-generated videos.",
    icon: VideoIcon,
    href: "/video",
  },
  {
    label: "Voice Synthesis",
    description: "Generate voice samples and narrations in various styles.",
    icon: Mic2,
    href: "/voice",
  },
  {
    label: "Art Generation",
    description: "Craft stunning AI-assisted artwork and designs.",
    icon: Palette,
    href: "/art",
  },
  {
    label: "Custom Models",
    description: "Train and configure your own AI models for specific tasks.",
    icon: Settings,
    href: "/custom",
  },
];

const DashboardPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Explore the Power of AI
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-light max-w-xl mx-auto mt-3">
            SynthAI enhances your workflows with AI-driven tools. Generate code, images, music, and more—all from one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.href}
              onClick={() => router.push(tool.href)}
              className={cn(
                "p-4 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-md bg-gray-100">
                  <tool.icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="font-medium text-gray-800">{tool.label}</div>
              </div>
              <p className="text-sm text-gray-600 font-light mb-3">
                {tool.description}
              </p>
              <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Analytics />
    </div>
  );
};

export default DashboardPage;