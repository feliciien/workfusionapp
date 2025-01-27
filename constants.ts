/** @format */

import {
  Brain,
  Code,
  FileText,
  History,
  ImageIcon,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  Mic2,
  Music,
  Network,
  Palette,
  PresentationIcon,
  VideoIcon
} from "lucide-react";

export const FREE_DAILY_LIMIT = 20; // Daily quota for free users

export const FEATURE_TYPES = {
  IMAGE_GENERATION: "image",
  CODE_GENERATION: "code",
  CODE_ANALYSIS: "code_analysis",
  VOICE_SYNTHESIS: "voice",
  CONTENT_WRITER: "content",
  PRESENTATION: "presentation",
  WEBSITE_PERFORMANCE: "website_performance",
  IDEA_GENERATOR: "ideas",
  VIDEO_GENERATION: "video",
  MUSIC_CREATION: "music",
  ART_STUDIO: "art",
  TRANSLATION: "translate",
  DATA_INSIGHTS: "data",
  NETWORK_ANALYSIS: "network",
  STUDY_ASSISTANT: "study",
  RESEARCH_ASSISTANT: "research",
  API_USAGE: "api"
} as const;

export const tools = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "Overview of your AI workspace and activities.",
    free: true,
    core: true
  },
  {
    label: "Network Monitor",
    icon: Network,
    href: "/network",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Monitor and analyze network performance metrics.",
    free: true,
    core: true
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Chat with our AI assistant to brainstorm ideas.",
    free: true,
    core: true
  },
  {
    label: "History",
    icon: History,
    href: "/history",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "View your past conversations and interactions.",
    free: true,
    core: true
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Generate stunning images with 20 free generations per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Generate code with 20 free generations per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Voice Synthesis",
    icon: Mic2,
    href: "/voice",
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    description: "Convert text to speech with 20 free requests per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Art Generation",
    icon: Palette,
    href: "/art",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Create artwork with 20 free generations per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Content Writer",
    icon: FileText,
    href: "/writer",
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Generate content with 20 free requests per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Presentation Creator",
    icon: PresentationIcon,
    href: "/presentation",
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    description: "Create presentations with 20 free generations per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Idea Generator",
    icon: Lightbulb,
    href: "/ideas",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Generate ideas with 20 free requests per day.",
    free: true,
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT
  },
  {
    label: "Video Creation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Create engaging videos from text prompts.",
    free: false,
    proOnly: true
  },
  {
    label: "Music Synthesis",
    icon: Music,
    href: "/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Create original music and audio tracks.",
    free: false,
    proOnly: true
  },
  {
    label: "Custom Models",
    icon: Brain,
    href: "/models",
    color: "text-red-700",
    bgColor: "bg-red-700/10",
    description: "Train and use custom AI models.",
    free: false,
    proOnly: true
  }
];

export const stats = [
  {
    value: "1M+",
    label: "Active Users",
    subtext: "Worldwide"
  },
  {
    value: "100+",
    label: "AI Models",
    subtext: "Integrated"
  },
  {
    value: "99.9%",
    label: "Uptime",
    subtext: "Reliability"
  },
  {
    value: "24/7",
    label: "Support",
    subtext: "Available"
  },
  {
    value: "99.99%",
    label: "Service Reliability",
    subtext: "Enterprise-grade infrastructure"
  },
  {
    value: "<15min",
    label: "Avg Response Time",
    subtext: "Dedicated technical support"
  }
];

export const features = [
  {
    title: "AI-Powered Code Generation",
    icon: Code,
    description:
      "Generate high-quality code snippets and complete applications with our advanced AI technology."
  },
  {
    title: "Smart Image Creation",
    icon: ImageIcon,
    description:
      "Create stunning visuals and artwork using state-of-the-art AI image generation."
  },
  {
    title: "Intelligent Conversation",
    icon: MessageSquare,
    description:
      "Engage in meaningful dialogues with our AI assistant for brainstorming and problem-solving."
  }
];
