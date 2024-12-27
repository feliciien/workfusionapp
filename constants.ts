import { 
  Code, 
  ImageIcon, 
  LayoutDashboard, 
  MessageSquare, 
  Music, 
  Settings, 
  VideoIcon,
  Mic2,
  Palette,
  Brain,
  History,
  Network,
  FileText,
  PresentationIcon,
  Lightbulb
} from "lucide-react";

export const MAX_PRO_COUNTS = 100;
export const PRO_CONTENT_WORD_LIMIT = 2000;
export const PRO_IDEA_LIMIT = 20;
export const PRO_PRESENTATION_SLIDES = 20;

export const MAX_FREE_COUNTS = 25;
export const FREE_CONTENT_WORD_LIMIT = 500;
export const FREE_IDEA_LIMIT = 5;
export const FREE_PRESENTATION_SLIDES = 5;

export const tools = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "Overview of your AI workspace and activities.",
    free: true
  },
  {
    label: 'Network Monitor',
    icon: Network,
    href: '/network',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Monitor and analyze network performance metrics.",
    free: false
  },
  {
    label: 'Conversation',
    icon: MessageSquare,
    href: '/conversation',
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Chat with the smartest AI - Experience the power of AI",
    free: true
  },
  {
    label: 'Music Generation',
    icon: Music,
    href: '/music',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Create original music and audio tracks.",
    free: false
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    href: '/image',
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Generate stunning images from text descriptions.",
    free: false
  },
  {
    label: 'Video Generation',
    icon: VideoIcon,
    href: '/video',
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Create engaging videos from text prompts.",
    free: false
  },
  {
    label: 'Code Generation',
    icon: Code,
    href: '/code',
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Generate code in any programming language.",
    free: false
  },
  {
    label: 'Voice Generation',
    icon: Mic2,
    href: '/voice',
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    description: "Convert text to natural-sounding speech.",
    free: false
  },
  {
    label: 'Art Generation',
    icon: Palette,
    href: '/art',
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Create stunning artwork with AI assistance.",
    free: false
  },
  {
    label: 'Content Generation',
    icon: FileText,
    href: '/content',
    color: "text-indigo-700",
    bgColor: "bg-indigo-700/10",
    description: "Generate engaging content for your needs.",
    free: false
  },
  {
    label: 'Presentation',
    icon: PresentationIcon,
    href: '/presentation',
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    description: "Create professional presentations with AI.",
    free: false
  },
  {
    label: 'Idea Generation',
    icon: Lightbulb,
    href: '/idea',
    color: "text-amber-700",
    bgColor: "bg-amber-700/10",
    description: "Generate creative ideas and solutions.",
    free: false
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    description: "Manage your account settings and subscription.",
    free: true
  }
];
