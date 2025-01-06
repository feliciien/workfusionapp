import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  VideoIcon,
  Sparkles,
  Brush,
  Wand2,
  Bot,
  BookOpen,
  Cog,
  Zap,
  Lightbulb,
  Rocket,
  Layers,
  Palette,
  Pencil,
  FileText,
  Headphones,
  Film,
  Binary,
  BrainCircuit,
  GraduationCap,
  Wrench
} from "lucide-react";

interface Route {
  label: string;
  icon: any;
  href: string;
  color?: string;
  bgColor?: string;
  limit?: number;
}

interface RouteCategory {
  category: string;
  items: Route[];
}

const essentialTools: Route[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    label: "Chat Assistant",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    limit: 20,
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: "/image",
    limit: 20
  },
];

const creativeTools: Route[] = [
  {
    label: "Music Generation",
    icon: Music,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    href: "/music",
    limit: 20
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/video",
    limit: 20
  },
  {
    label: "Art Studio",
    icon: Palette,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/art",
    limit: 20
  },
];

const productivityTools: Route[] = [
  {
    label: "Code Generation",
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/code",
    limit: 20
  },
  {
    label: "Writing Assistant",
    icon: Pencil,
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    href: "/writing",
    limit: 20
  },
  {
    label: "Document Analysis",
    icon: FileText,
    color: "text-yellow-700",
    bgColor: "bg-yellow-700/10",
    href: "/document",
    limit: 20
  },
];

const advancedTools: Route[] = [
  {
    label: "Neural Processing",
    icon: BrainCircuit,
    color: "text-purple-700",
    bgColor: "bg-purple-700/10",
    href: "/neural",
    limit: 10
  },
  {
    label: "Data Analysis",
    icon: Binary,
    color: "text-indigo-700",
    bgColor: "bg-indigo-700/10",
    href: "/data",
    limit: 10
  },
];

const educationTools: Route[] = [
  {
    label: "Learning Path",
    icon: GraduationCap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    href: "/learning",
    limit: 20
  },
  {
    label: "Study Assistant",
    icon: BookOpen,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    href: "/study",
    limit: 20
  },
];

const systemTools: Route[] = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-700",
    bgColor: "bg-gray-700/10",
  },
];

export const routes: RouteCategory[] = [
  {
    category: "Essential Tools",
    items: essentialTools,
  },
  {
    category: "Creative Suite",
    items: creativeTools,
  },
  {
    category: "Productivity Tools",
    items: productivityTools,
  },
  {
    category: "Advanced Tools",
    items: advancedTools,
  },
  {
    category: "Education Tools",
    items: educationTools,
  },
  {
    category: "System",
    items: systemTools,
  },
];
