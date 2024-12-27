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
  FileText,
  Languages,
  BarChart,
  BookOpen,
  Brain,
  Lightbulb,
  Share2,
  Sparkles,
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
  free: boolean;
  limit?: string;
}

export const tools: Tool[] = [
  // Communication & Writing
  {
    label: "Conversation",
    description: "Chat seamlessly with our AI assistant for ideas and help.",
    icon: MessageSquare,
    href: "/conversation",
    category: "Communication & Writing",
    bgColor: "bg-violet-500/10",
    color: "text-violet-500",
    free: true
  },
  {
    label: "Content Writer",
    description: "Generate high-quality articles and blog posts.",
    icon: FileText,
    href: "/content",
    category: "Communication & Writing",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-500",
    free: true,
    limit: "500 words"
  },
  {
    label: "Translation",
    description: "Translate text between multiple languages accurately.",
    icon: Languages,
    href: "/translate",
    category: "Communication & Writing",
    bgColor: "bg-blue-500/10",
    color: "text-blue-500",
    free: true
  },

  // Visual Creation
  {
    label: "Image Generation",
    description: "Create unique images from text descriptions.",
    icon: ImageIcon,
    href: "/image",
    category: "Visual Creation",
    bgColor: "bg-pink-700/10",
    color: "text-pink-700",
    free: true,
    limit: "25 generations"
  },
  {
    label: "Video Generation",
    description: "Transform text into engaging video content.",
    icon: VideoIcon,
    href: "/video",
    category: "Visual Creation",
    bgColor: "bg-orange-700/10",
    color: "text-orange-700",
    free: false
  },
  {
    label: "Art Generation",
    description: "Create stunning artwork with AI assistance.",
    icon: Palette,
    href: "/art",
    category: "Visual Creation",
    bgColor: "bg-purple-700/10",
    color: "text-purple-700",
    free: true,
    limit: "Basic styles"
  },

  // Audio & Music
  {
    label: "Music Synthesis",
    description: "Create original music and audio tracks.",
    icon: Music,
    href: "/music",
    category: "Audio & Music",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-500",
    free: false
  },
  {
    label: "Voice Synthesis",
    description: "Generate natural-sounding voice narrations.",
    icon: Mic2,
    href: "/voice",
    category: "Audio & Music",
    bgColor: "bg-yellow-500/10",
    color: "text-yellow-500",
    free: true,
    limit: "Basic voices"
  },

  // Development & Analysis
  {
    label: "Code Generation",
    description: "Generate code snippets and full components.",
    icon: Code,
    href: "/code",
    category: "Development & Analysis",
    bgColor: "bg-green-700/10",
    color: "text-green-700",
    free: true,
    limit: "Basic templates"
  },
  {
    label: "Custom Models",
    description: "Train and customize AI models for your needs.",
    icon: Brain,
    href: "/custom",
    category: "Development & Analysis",
    bgColor: "bg-blue-700/10",
    color: "text-blue-700",
    free: false
  },

  // Productivity Tools
  {
    label: "Presentation Creator",
    description: "Create professional presentations quickly.",
    icon: Share2,
    href: "/presentation",
    category: "Productivity Tools",
    bgColor: "bg-red-700/10",
    color: "text-red-700",
    free: true,
    limit: "Basic templates"
  },
  {
    label: "Idea Generator",
    description: "Get creative ideas for any project.",
    icon: Lightbulb,
    href: "/ideas",
    category: "Productivity Tools",
    bgColor: "bg-amber-500/10",
    color: "text-amber-500",
    free: true,
    limit: "5 ideas"
  }
];
