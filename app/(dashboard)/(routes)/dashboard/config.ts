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
  Lightbulb,
  Settings,
  Sparkles,
  Blocks
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

export const tools: Tool[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    description: "View your AI workspace and access all tools"
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Chat with the smartest AI",
    limitedFree: true,
    freeLimit: 5
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    description: "Generate images using AI",
    proOnly: true
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    description: "Create videos using AI",
    proOnly: true
  },
  {
    label: "Music Generation",
    icon: Music,
    href: "/music",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Create music using AI",
    proOnly: true
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    description: "Generate code using AI",
    proOnly: true
  },
  {
    label: "Presentation",
    icon: PresentationIcon,
    href: "/presentation",
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Create presentations using AI",
    proOnly: true
  },
  {
    label: "Content Writing",
    icon: FileText,
    href: "/content",
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    description: "Generate content using AI",
    proOnly: true
  },
  {
    label: "Ideas & Brainstorming",
    icon: Lightbulb,
    href: "/ideas",
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    description: "Generate ideas using AI",
    proOnly: true
  },
  {
    label: "Study Assistant",
    icon: BookOpen,
    href: "/study",
    color: "text-indigo-700",
    bgColor: "bg-indigo-700/10",
    description: "Study smarter with AI",
    proOnly: true
  },
  {
    label: "Translation",
    icon: Languages,
    href: "/translate",
    color: "text-teal-700",
    bgColor: "bg-teal-700/10",
    description: "Translate text using AI",
    proOnly: true
  },
  {
    label: "Data Insights",
    icon: LineChart,
    href: "/data-insights",
    color: "text-red-700",
    bgColor: "bg-red-700/10",
    description: "Analyze data using AI",
    proOnly: true
  },
  {
    label: "Research Assistant",
    icon: Sparkles,
    href: "/research",
    color: "text-amber-700",
    bgColor: "bg-amber-700/10",
    description: "Research smarter with AI",
    proOnly: true
  },
  {
    label: "Learning Path",
    icon: Blocks,
    href: "/learning",
    color: "text-cyan-700",
    bgColor: "bg-cyan-700/10",
    description: "Learn with AI guidance",
    proOnly: true
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-700",
    bgColor: "bg-gray-700/10",
    description: "Manage your account settings"
  }
];

export const categories = [
  {
    name: "Essential Tools",
    routes: tools.filter(tool => 
      ["Dashboard", "Conversation", "Settings"].includes(tool.label)
    )
  },
  {
    name: "Creative Tools",
    routes: tools.filter(tool => 
      ["Image Generation", "Video Generation", "Music Generation", "Content Writing", "Presentation"].includes(tool.label)
    )
  },
  {
    name: "Professional Tools",
    routes: tools.filter(tool => 
      ["Code Generation", "Data Insights", "Research Assistant", "Translation"].includes(tool.label)
    )
  },
  {
    name: "Learning Tools",
    routes: tools.filter(tool => 
      ["Study Assistant", "Learning Path", "Ideas & Brainstorming"].includes(tool.label)
    )
  }
];
