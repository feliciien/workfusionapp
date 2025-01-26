import { 
  Code, 
  ImageIcon, 
  MessageSquare, 
  Music, 
  VideoIcon,
  Mic2,
  Palette,
  Brain,
  Network,
  FileText,
  PresentationIcon,
  Lightbulb,
  Languages,
  LineChart,
  BookOpen,
  Search,
  Monitor
} from "lucide-react";
import { FEATURE_TYPES, FREE_DAILY_LIMIT } from "@/constants";

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
    label: 'Image Generation',
    icon: ImageIcon,
    href: '/image',
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Generate stunning images from text descriptions.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "IMAGE_GENERATION"
  },
  {
    label: 'Code Assistant',
    icon: Code,
    href: '/code',
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Generate code snippets and get programming help.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "CODE_GENERATION"
  },
  {
    label: 'Content Writer',
    icon: FileText,
    href: '/content',
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    description: "Generate high-quality articles and blog posts.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "CONTENT_WRITER"
  },
  {
    label: 'Translation',
    icon: Languages,
    href: '/translate',
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    description: "Translate text between multiple languages accurately.",
    proOnly: true,
    featureType: "TRANSLATION"
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    href: '/image',
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Create stunning images from text descriptions.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "IMAGE_GENERATION"
  },
  {
    label: 'Music Creation',
    icon: Music,
    href: '/music',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Compose original music and melodies.",
    proOnly: true,
    featureType: "MUSIC_CREATION"
  },
  {
    label: 'Video Generation',
    icon: VideoIcon,
    href: '/video',
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Create and edit videos with AI assistance.",
    proOnly: true,
    featureType: "VIDEO_GENERATION"
  },
  {
    label: 'Art Studio',
    icon: Palette,
    href: '/art',
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Create digital art with AI assistance.",
    proOnly: true,
    featureType: "ART_STUDIO"
  },
  {
    label: 'Code Analysis',
    icon: Search,
    href: '/code-analysis',
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
    description: "Analyze and improve your code quality.",
    proOnly: true,
    featureType: "CODE_ANALYSIS"
  },
  {
    label: 'Website Performance Analyzer',
    icon: Monitor,
    href: '/website-performance',
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    description: "Analyze website performance and get optimization insights.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "WEBSITE_PERFORMANCE"
  },
  {
    label: 'Data Insights',
    icon: LineChart,
    href: '/data-insights',
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Generate insights from your data.",
    proOnly: true,
    featureType: "DATA_INSIGHTS"
  },
  {
    label: 'Presentation',
    icon: PresentationIcon,
    href: '/presentation',
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    description: "Create professional presentations instantly.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "PRESENTATION"
  },
  {
    label: 'Network Analysis',
    icon: Network,
    href: '/network',
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "Analyze and visualize network data.",
    proOnly: true,
    featureType: "NETWORK_ANALYSIS"
  },
  {
    label: 'Study Assistant',
    icon: BookOpen,
    href: '/study',
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    description: "Get help with studying and research.",
    proOnly: true,
    featureType: "STUDY_ASSISTANT"
  },
  {
    label: 'Idea Generator',
    icon: Lightbulb,
    href: '/ideas',
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
    description: "Generate creative ideas for any project.",
    limitedFree: true,
    freeLimit: FREE_DAILY_LIMIT,
    featureType: "IDEA_GENERATOR"
  }
];

export const routeCategories = [
  {
    name: "Communication & Writing",
    routes: tools.filter(tool => 
      ["CONTENT_WRITER", "TRANSLATION"].includes(tool.featureType as string)
    )
  },
  {
    name: "Creative Suite",
    routes: tools.filter(tool => 
      ["IMAGE_GENERATION", "MUSIC_CREATION", "VIDEO_GENERATION", "ART_STUDIO"].includes(tool.featureType as string)
    )
  },
  {
    name: "Development Tools",
    routes: tools.filter(tool => 
      ["CODE_GENERATION", "CODE_ANALYSIS", "WEBSITE_PERFORMANCE"].includes(tool.featureType as string)
    )
  },
  {
    name: "Business Tools",
    routes: tools.filter(tool => 
      ["DATA_INSIGHTS", "PRESENTATION", "NETWORK_ANALYSIS"].includes(tool.featureType as string)
    )
  },
  {
    name: "Learning & Research",
    routes: tools.filter(tool => 
      ["STUDY_ASSISTANT", "IDEA_GENERATOR"].includes(tool.featureType as string)
    )
  }
];
