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
    color: "text-violet-500"
  },
  {
    label: "Content Writer",
    description: "Generate high-quality articles and blog posts.",
    icon: FileText,
    href: "/content",
    category: "Communication & Writing",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-500"
  },
  {
    label: "Translation",
    description: "Translate text between multiple languages accurately.",
    icon: Languages,
    href: "/translate",
    category: "Communication & Writing",
    bgColor: "bg-blue-500/10",
    color: "text-blue-500"
  },

  // Creative Suite
  {
    label: "Image Generation",
    description: "Create stunning images from text descriptions.",
    icon: ImageIcon,
    href: "/image",
    category: "Creative Suite",
    bgColor: "bg-pink-500/10",
    color: "text-pink-500"
  },
  {
    label: "Music Creation",
    description: "Compose original music and melodies.",
    icon: Music,
    href: "/music",
    category: "Creative Suite",
    bgColor: "bg-purple-500/10",
    color: "text-purple-500"
  },
  {
    label: "Video Generation",
    description: "Create and edit videos with AI assistance.",
    icon: VideoIcon,
    href: "/video",
    category: "Creative Suite",
    bgColor: "bg-orange-500/10",
    color: "text-orange-500"
  },

  // Development Tools
  {
    label: "Code Generation",
    description: "Generate code snippets and entire functions.",
    icon: Code,
    href: "/code",
    category: "Development Tools",
    bgColor: "bg-green-500/10",
    color: "text-green-500"
  },
  {
    label: "Code Analysis",
    description: "Analyze and improve your code quality.",
    icon: Brain,
    href: "/code-analysis",
    category: "Development Tools",
    bgColor: "bg-indigo-500/10",
    color: "text-indigo-500"
  },

  // Business Tools
  {
    label: "Analytics Insights",
    description: "Generate insights from your data.",
    icon: BarChart,
    href: "/data-insights",
    category: "Business Tools",
    bgColor: "bg-yellow-500/10",
    color: "text-yellow-500"
  },
  {
    label: "Presentation Creator",
    description: "Create professional presentations instantly.",
    icon: Sparkles,
    href: "/presentation",
    category: "Business Tools",
    bgColor: "bg-red-500/10",
    color: "text-red-500"
  },

  // Learning & Research
  {
    label: "Study Assistant",
    description: "Get help with studying and research.",
    icon: BookOpen,
    href: "/study",
    category: "Learning & Research",
    bgColor: "bg-teal-500/10",
    color: "text-teal-500"
  },
  {
    label: "Idea Generator",
    description: "Generate creative ideas for any project.",
    icon: Lightbulb,
    href: "/ideas",
    category: "Learning & Research",
    bgColor: "bg-amber-500/10",
    color: "text-amber-500"
  }
];
