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
  Search
} from "lucide-react";
import { FEATURE_TYPES, FREE_LIMITS } from "@/constants";

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
    freeLimit: FREE_LIMITS.image,
    featureType: "IMAGE_GENERATION"
  },
  {
    label: 'Code Assistant',
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: '/code',
    description: "Your AI pair programmer. Get help with coding tasks.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.code,
    featureType: "CODE_GENERATION"
  },
  {
    label: 'Voice Synthesis',
    icon: Mic2,
    color: "text-violet-700",
    bgColor: "bg-violet-700/10",
    href: '/voice',
    description: "Convert text to natural-sounding speech.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.voice,
    featureType: "VOICE_SYNTHESIS"
  },
  {
    label: 'Content Writer',
    icon: MessageSquare,
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    href: '/content',
    description: "Generate high-quality content for various purposes.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.content,
    featureType: "CONTENT_WRITER"
  },
  {
    label: 'Presentation Maker',
    icon: PresentationIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: '/presentation',
    description: "Create professional presentations in minutes.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.presentation,
    featureType: "PRESENTATION"
  },
  {
    label: 'Idea Generator',
    icon: Lightbulb,
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    href: '/idea',
    description: "Get creative ideas for your projects.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.idea,
    featureType: "IDEA_GENERATOR"
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    href: '/video',
    description: "Create engaging videos with AI.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.video,
    featureType: "VIDEO_GENERATION"
  },
  {
    label: 'Music Studio',
    icon: Music,
    color: "text-emerald-700",
    bgColor: "bg-emerald-700/10",
    href: '/music',
    description: "Create and compose music with AI.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.music,
    featureType: "MUSIC_CREATION"
  },
  {
    label: 'Art Studio',
    icon: Palette,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: '/art',
    description: "Create digital art with AI assistance.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.art,
    featureType: "ART_STUDIO"
  },
  {
    label: 'Translation',
    icon: Languages,
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    href: '/translation',
    description: "Translate text between languages.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.translation,
    featureType: "TRANSLATION"
  },
  {
    label: 'Data Insights',
    icon: LineChart,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: '/data',
    description: "Analyze data and get insights.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.data,
    featureType: "DATA_INSIGHTS"
  },
  {
    label: 'Network Analysis',
    icon: Network,
    color: "text-violet-700",
    bgColor: "bg-violet-700/10",
    href: '/network',
    description: "Analyze and visualize networks.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.network,
    featureType: "NETWORK_ANALYSIS"
  },
  {
    label: 'Study Assistant',
    icon: BookOpen,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: '/study',
    description: "Get help with your studies.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.study,
    featureType: "STUDY_ASSISTANT"
  },
  {
    label: 'Research Assistant',
    icon: Search,
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    href: '/research',
    description: "Get help with research tasks.",
    limitedFree: true,
    freeLimit: FREE_LIMITS.research,
    featureType: "RESEARCH_ASSISTANT"
  }
];

export const routeCategories = [
  {
    name: "Essential Tools",
    routes: tools.filter(tool => 
      ["IMAGE_GENERATION", "CODE_GENERATION", "CONTENT_WRITER"].includes(tool.featureType as string)
    )
  },
  {
    name: "Creative Suite",
    routes: tools.filter(tool => 
      ["VIDEO_GENERATION", "MUSIC_CREATION", "ART_STUDIO", "VOICE_SYNTHESIS"].includes(tool.featureType as string)
    )
  },
  {
    name: "Productivity Tools",
    routes: tools.filter(tool => 
      ["PRESENTATION", "IDEA_GENERATOR", "TRANSLATION"].includes(tool.featureType as string)
    )
  },
  {
    name: "Advanced Tools",
    routes: tools.filter(tool => 
      ["DATA_INSIGHTS", "NETWORK_ANALYSIS", "STUDY_ASSISTANT", "RESEARCH_ASSISTANT"].includes(tool.featureType as string)
    )
  }
];
