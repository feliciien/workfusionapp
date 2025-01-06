import { 
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  VideoIcon,
  Newspaper,
  FileText,
  PenTool,
  Languages,
  BookOpen,
  Binary,
  FileCode2,
  Braces,
  Terminal,
  Database,
  LineChart,
  Search,
  Wand2,
  Bot,
  Mic2,
  Palette,
  Network,
  PresentationIcon,
  Lightbulb
} from "lucide-react";
import { FEATURE_TYPES } from "@/constants";

type FeatureType = typeof FEATURE_TYPES[keyof typeof FEATURE_TYPES];

const ESSENTIAL_TOOLS = [FEATURE_TYPES.IMAGE_GENERATION, FEATURE_TYPES.CODE_GENERATION, FEATURE_TYPES.CONTENT_WRITER] as const;
const CREATIVE_TOOLS = [FEATURE_TYPES.VIDEO_GENERATION, FEATURE_TYPES.MUSIC_CREATION, FEATURE_TYPES.ART_STUDIO, FEATURE_TYPES.VOICE_SYNTHESIS] as const;
const PROFESSIONAL_TOOLS = [FEATURE_TYPES.PRESENTATION, FEATURE_TYPES.IDEA_GENERATOR, FEATURE_TYPES.TRANSLATION] as const;
const ADVANCED_TOOLS = [FEATURE_TYPES.DATA_INSIGHTS, FEATURE_TYPES.NETWORK_ANALYSIS, FEATURE_TYPES.STUDY, FEATURE_TYPES.RESEARCH] as const;

type EssentialToolType = typeof ESSENTIAL_TOOLS[number];
type CreativeToolType = typeof CREATIVE_TOOLS[number];
type ProfessionalToolType = typeof PROFESSIONAL_TOOLS[number];
type AdvancedToolType = typeof ADVANCED_TOOLS[number];

export const FREE_LIMITS = {
  image: 5,
  code: 5,
  voice: 5,
  content: 5,
  presentation: 5,
  idea: 5,
  video: 5,
  music: 5,
  art: 5,
  translation: 5,
  data: 5,
  network: 5,
  study: 5,
  research: 5
} as const;

export interface Tool {
  label: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  description: string;
  limitedFree?: boolean;
  freeLimit?: number;
  featureType?: FeatureType;
  proOnly?: boolean;
}

const tools: Tool[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "View your dashboard and analytics"
  },
  {
    label: 'Chat Assistant',
    icon: MessageSquare,
    href: '/conversation',
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Our most advanced conversation model for general assistance.",
    limitedFree: true,
    freeLimit: 5
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    href: '/image',
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Turn your ideas into stunning images.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.IMAGE_GENERATION
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    href: '/video',
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    description: "Create engaging videos with AI.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.VIDEO_GENERATION
  },
  {
    label: 'Music Studio',
    icon: Music,
    href: '/music',
    color: "text-emerald-700",
    bgColor: "bg-emerald-700/10",
    description: "Create and compose music with AI.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.MUSIC_CREATION
  },
  {
    label: 'Code Generation',
    icon: Code,
    href: '/code',
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Generate code in any programming language.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.CODE_GENERATION
  },
  {
    label: 'Content Writer',
    icon: FileText,
    href: '/content',
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Generate high-quality content for various purposes.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.CONTENT_WRITER
  },
  {
    label: 'Art Studio',
    icon: Palette,
    href: '/art',
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Create digital art with AI assistance.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.ART_STUDIO
  },
  {
    label: 'Voice Synthesis',
    icon: Mic2,
    href: '/voice',
    color: "text-violet-700",
    bgColor: "bg-violet-700/10",
    description: "Convert text to natural-sounding speech.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.VOICE_SYNTHESIS
  },
  {
    label: 'Presentation Maker',
    icon: PresentationIcon,
    href: '/presentation',
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Create professional presentations in minutes.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.PRESENTATION
  },
  {
    label: 'Idea Generator',
    icon: Lightbulb,
    href: '/idea',
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    description: "Get creative ideas for your projects.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.IDEA_GENERATOR
  },
  {
    label: 'Translation',
    icon: Languages,
    href: '/translation',
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Translate text between languages.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.TRANSLATION
  },
  {
    label: 'Data Insights',
    icon: LineChart,
    href: '/data',
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Analyze data and get insights.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.DATA_INSIGHTS
  },
  {
    label: 'Network Analysis',
    icon: Network,
    href: '/network',
    color: "text-violet-700",
    bgColor: "bg-violet-700/10",
    description: "Analyze and visualize networks.",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.NETWORK_ANALYSIS
  },
  {
    label: 'Study Assistant',
    icon: BookOpen,
    href: '/study',
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Get help with studying and learning",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.STUDY
  },
  {
    label: 'Research Assistant',
    icon: Search,
    href: '/research',
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Research any topic with AI",
    limitedFree: true,
    freeLimit: 5,
    featureType: FEATURE_TYPES.RESEARCH
  }
];

export const categories = [
  {
    name: "Essential Tools",
    routes: tools.filter(tool => 
      tool.featureType && ESSENTIAL_TOOLS.includes(tool.featureType as EssentialToolType)
    )
  },
  {
    name: "Creative Tools", 
    routes: tools.filter(tool =>
      tool.featureType && CREATIVE_TOOLS.includes(tool.featureType as CreativeToolType)
    )
  },
  {
    name: "Professional Tools",
    routes: tools.filter(tool =>
      tool.featureType && PROFESSIONAL_TOOLS.includes(tool.featureType as ProfessionalToolType)
    )
  },
  {
    name: "Advanced Tools",
    routes: tools.filter(tool =>
      tool.featureType && ADVANCED_TOOLS.includes(tool.featureType as AdvancedToolType)
    )
  }
];
