import { 
  Code, 
  MessageSquare, 
  ImageIcon,
  VideoIcon,
  Music,
  Settings,
  Network,
  FileText,
  Database,
  Bot,
  Lightbulb,
  Languages,
  PenTool,
  Presentation,
  GraduationCap,
  BookOpen,
  Mic,
  Palette
} from "lucide-react";

// Essential Tools
const essentialTools = [
  {
    label: 'Image Generation',
    icon: ImageIcon,
    href: '/image',
    color: 'text-pink-700',
    limit: 5,
  },
  {
    label: 'Code Assistant',
    icon: Code,
    href: '/code',
    color: 'text-green-700',
    limit: 10,
  },
  {
    label: 'Content Writer',
    icon: MessageSquare,
    href: '/content',
    color: 'text-violet-500',
    limit: 10,
  },
];

// Creative Suite
const creativeSuite = [
  {
    label: 'Voice Synthesis',
    icon: Mic,
    href: '/voice',
    color: 'text-blue-500',
    limit: 10,
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    href: '/video',
    color: 'text-orange-700',
    limit: 3,
  },
  {
    label: 'Music Studio',
    icon: Music,
    href: '/music',
    color: 'text-emerald-500',
    limit: 5,
  },
  {
    label: 'Art Studio',
    icon: Palette,
    href: '/art',
    color: 'text-purple-500',
    limit: 5,
  },
];

// Productivity Tools
const productivityTools = [
  {
    label: 'Presentation Maker',
    icon: Presentation,
    href: '/presentation',
    color: 'text-yellow-600',
    limit: 5,
  },
  {
    label: 'Idea Generator',
    icon: Lightbulb,
    href: '/ideas',
    color: 'text-amber-500',
    limit: 10,
  },
  {
    label: 'Translation',
    icon: Languages,
    href: '/translate',
    color: 'text-sky-500',
    limit: 20,
  },
];

// Advanced Tools
const advancedTools = [
  {
    label: 'Data Insights',
    icon: Database,
    href: '/data',
    color: 'text-indigo-500',
    limit: 10,
  },
  {
    label: 'Network Analysis',
    icon: Network,
    href: '/network',
    color: 'text-rose-500',
    limit: 5,
  },
  {
    label: 'Study Assistant',
    icon: GraduationCap,
    href: '/study',
    color: 'text-teal-500',
    limit: 10,
  },
  {
    label: 'Research Assistant',
    icon: BookOpen,
    href: '/research',
    color: 'text-cyan-500',
    limit: 10,
  },
];

// Settings
const systemTools = [
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-500',
  },
];

export const routes = [
  {
    category: 'Essential Tools',
    items: essentialTools,
  },
  {
    category: 'Creative Suite',
    items: creativeSuite,
  },
  {
    category: 'Productivity Tools',
    items: productivityTools,
  },
  {
    category: 'Advanced Tools',
    items: advancedTools,
  },
  {
    category: 'System',
    items: systemTools,
  },
];
