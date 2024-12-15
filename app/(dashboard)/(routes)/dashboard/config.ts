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
import { LucideIcon } from "lucide-react";

export interface Tool {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
  bgColor: string;
  color: string;
}

export const tools: Tool[] = [
  {
    label: "Conversation",
    description: "Chat seamlessly with our AI assistant to brainstorm ideas.",
    icon: MessageSquare,
    href: "/conversation",
    category: "Communication",
    bgColor: "bg-violet-500/10",
    color: "text-violet-500"
  },
  {
    label: "Image Generation",
    description: "Create unique images and illustrations from your prompts.",
    icon: ImageIcon,
    href: "/image",
    category: "Visual",
    bgColor: "bg-pink-500/10",
    color: "text-pink-500"
  },
  {
    label: "Code Generation",
    description: "Generate code snippets, functions, or entire modules.",
    icon: Code,
    href: "/code",
    category: "Development",
    bgColor: "bg-green-500/10",
    color: "text-green-500"
  },
  {
    label: "Music Synthesis",
    description: "Produce custom audio tracks suited for your projects.",
    icon: Music,
    href: "/music",
    category: "Audio",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-500"
  },
  {
    label: "Video Creation",
    description: "Convert text-based ideas into short, AI-generated videos.",
    icon: VideoIcon,
    href: "/video",
    category: "Visual",
    bgColor: "bg-orange-500/10",
    color: "text-orange-500"
  },
  {
    label: "Voice Synthesis",
    description: "Transform text into natural-sounding speech.",
    icon: Mic2,
    href: "/voice",
    category: "Audio",
    bgColor: "bg-blue-500/10",
    color: "text-blue-500"
  },
  {
    label: "Art Generation",
    description: "Create stunning artwork using AI algorithms.",
    icon: Palette,
    href: "/art",
    category: "Visual",
    bgColor: "bg-indigo-500/10",
    color: "text-indigo-500"
  },
  {
    label: "Custom Models",
    description: "Train and deploy custom AI models for your needs.",
    icon: Settings,
    href: "/custom",
    category: "Development",
    bgColor: "bg-gray-500/10",
    color: "text-gray-500"
  },
];
