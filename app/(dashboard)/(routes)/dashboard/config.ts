/** @format */

import { FEATURE_TYPES, FREE_DAILY_LIMIT } from "@/constants";
import {
  BookOpen,
  Code,
  FileText,
  ImageIcon,
  Languages,
  Lightbulb,
  LineChart,
  Mic2,
  Music,
  Network,
  Palette,
  PresentationIcon,
  Search,
  Settings,
  VideoIcon
} from "lucide-react";

export interface Tool {
  label: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  description: string;
  limitedFree?: boolean;
  freeLimit?: number;
  proOnly?: boolean;
  featureType?: keyof typeof FEATURE_TYPES;
}

export const tools: Tool[] = [
  {
    label: "Website Performance",
    icon: Settings,
    href: "/website-performance",
    color: "text-gray-700",
    bgColor: "bg-gray-700/10",
    description: "Analyze and optimize your website's performance.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "WEBSITE_PERFORMANCE"
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Generate stunning images from text descriptions.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "IMAGE_GENERATION"
  },
  {
    label: "Code Assistant",
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/code",
    description: "Generate code and get programming help.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "CODE_GENERATION"
  },
  {
    label: "Voice Synthesis",
    icon: Mic2,
    href: "/voice",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Convert text to natural-sounding speech.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "VOICE_SYNTHESIS"
  },
  {
    label: "Content Writer",
    icon: FileText,
    href: "/content",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Generate articles, blogs, and marketing copy.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "CONTENT_WRITER"
  },
  {
    label: "Presentation",
    icon: PresentationIcon,
    href: "/presentation",
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Create professional presentations.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "PRESENTATION"
  },
  {
    label: "Idea Generator",
    icon: Lightbulb,
    href: "/ideas",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Generate creative ideas and solutions.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "IDEA_GENERATOR"
  },
  {
    label: "Video Creation",
    icon: VideoIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/video",
    description: "Create videos from text descriptions.",
    proOnly: true,
    featureType: "VIDEO_GENERATION"
  },
  {
    label: "Music Creation",
    icon: Music,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/music",
    description: "Generate original music and melodies.",
    proOnly: true,
    featureType: "MUSIC_CREATION"
  },
  {
    label: "Art Studio",
    icon: Palette,
    href: "/art",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Create digital art with AI assistance.",
    proOnly: true,
    featureType: "ART_STUDIO"
  },
  {
    label: "Translation",
    icon: Languages,
    href: "/translate",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Translate text between languages.",
    proOnly: true,
    featureType: "TRANSLATION"
  },
  {
    label: "Data Insights",
    icon: LineChart,
    href: "/data-insights",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Generate insights from your data.",
    proOnly: true,
    featureType: "DATA_INSIGHTS"
  },
  {
    label: "Network Analysis",
    icon: Network,
    href: "/network",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Analyze and visualize network data.",
    proOnly: true,
    featureType: "NETWORK_ANALYSIS"
  },
  {
    label: "Study Assistant",
    icon: BookOpen,
    href: "/study",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "AI-powered study and learning assistance.",
    proOnly: true,
    featureType: "STUDY_ASSISTANT"
  },
  {
    label: "Research Assistant",
    icon: Search,
    href: "/research",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "AI-powered research assistance.",
    proOnly: true,
    featureType: "RESEARCH_ASSISTANT"
  }
];

export const routeCategories = [
  {
    name: "Essential Tools",
    routes: tools.filter((tool) =>
      ["IMAGE_GENERATION", "CODE_GENERATION", "CONTENT_WRITER"].includes(
        tool.featureType as string
      )
    )
  },
  {
    name: "Creative Suite",
    routes: tools.filter((tool) =>
      [
        "VIDEO_GENERATION",
        "MUSIC_CREATION",
        "ART_STUDIO",
        "VOICE_SYNTHESIS"
      ].includes(tool.featureType as string)
    )
  },
  {
    name: "Productivity Tools",
    routes: tools.filter((tool) =>
      ["PRESENTATION", "IDEA_GENERATOR", "TRANSLATION"].includes(
        tool.featureType as string
      )
    )
  },
  {
    name: "Advanced Tools",
    routes: tools.filter((tool) =>
      [
        "DATA_INSIGHTS",
        "NETWORK_ANALYSIS",
        "STUDY_ASSISTANT",
        "RESEARCH_ASSISTANT"
      ].includes(tool.featureType as string)
    )
  }
];
