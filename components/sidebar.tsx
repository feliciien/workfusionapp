// components/sidebar.tsx

"use client";

import { FreeCounter } from "@/components/free-counter";
import { ProLink } from "@/components/pro-link";
import { FREE_DAILY_LIMIT, FEATURE_TYPES } from "@/constants";
import { getFeatureUsage } from "@/lib/feature-limit";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  History,
  ImageIcon,
  Languages,
  Lightbulb,
  LineChart,
  MessageSquare,
  Music,
  Network,
  Palette,
  PresentationIcon,
  Search,
  Settings,
  VideoIcon,
  Users
} from "lucide-react";
import { Montserrat } from 'next/font/google';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const montserrat = Montserrat({ weight: '600', subsets: ['latin'] });

interface RouteCategory {
  name: string;
  routes: Route[];
}

type FeatureType = typeof FEATURE_TYPES[keyof typeof FEATURE_TYPES];

interface Route {
  label: string;
  icon: any;
  href: string;
  color: string;
  description: string;
  free: boolean;
  core?: boolean;
  proOnly?: boolean;
  limitedFree?: boolean;
  freeLimit?: number;
  featureType?: FeatureType;
}

interface FeatureUsage {
  [key: string]: number;
}

const routeCategories: RouteCategory[] = [
  {
    name: "Communication & Writing",
    routes: [
      {
        label: 'Conversation',
        icon: MessageSquare,
        href: '/conversation',
        color: "text-violet-500",
        description: "Chat seamlessly with our AI assistant for ideas and help.",
        free: true,
        core: true
      },
      {
        label: 'Content Writer',
        icon: FileText,
        color: "text-blue-600",
        href: '/content',
        description: "Generate high-quality articles and blog posts.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_DAILY_LIMIT,
        featureType: FEATURE_TYPES.CONTENT_WRITER
      },
      {
        label: 'Translation',
        icon: Languages,
        color: "text-green-600",
        href: '/translate',
        description: "Translate text between multiple languages accurately.",
        free: false,
        proOnly: true
      }
    ]
  },
  {
    name: "Creative Suite",
    routes: [
      {
        label: 'Image Generation',
        icon: ImageIcon,
        color: "text-pink-700",
        href: '/image',
        description: "Create stunning images from text descriptions.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_DAILY_LIMIT,
        featureType: FEATURE_TYPES.IMAGE_GENERATION
      },
      {
        label: 'Music Creation',
        icon: Music,
        color: "text-emerald-500",
        href: '/music',
        description: "Compose original music and melodies.",
        free: false,
        proOnly: true
      },
      {
        label: 'Video Generation',
        icon: VideoIcon,
        color: "text-orange-700",
        href: '/video',
        description: "Create and edit videos with AI assistance.",
        free: false,
        proOnly: true
      },
      {
        label: 'Art Studio',
        icon: Palette,
        color: "text-purple-500",
        href: '/art',
        description: "Create digital art with AI assistance.",
        free: false,
        proOnly: true
      }
    ]
  },
  {
    name: "Development Tools",
    routes: [
      {
        label: 'Code Generation',
        icon: Code,
        color: "text-green-700",
        href: '/code',
        description: "Generate code snippets and entire functions.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_DAILY_LIMIT,
        featureType: FEATURE_TYPES.CODE_GENERATION
      },
      {
        label: 'Code Analysis',
        icon: Search,
        color: "text-yellow-600",
        href: '/code-analysis',
        description: "Analyze and improve your code quality.",
        free: false,
        proOnly: true
      }
    ]
  },
  {
    name: "Business Tools",
    routes: [
      {
        label: 'Data Insights',
        icon: LineChart,
        color: "text-blue-500",
        href: '/data-insights',
        description: "Generate insights from your data.",
        free: false,
        proOnly: true
      },
      {
        label: 'Presentation',
        icon: PresentationIcon,
        color: "text-orange-600",
        href: '/presentation',
        description: "Create professional presentations instantly.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_DAILY_LIMIT,
        featureType: FEATURE_TYPES.PRESENTATION
      },
      {
        label: 'Network Analysis',
        icon: Network,
        color: "text-indigo-500",
        href: '/network',
        description: "Analyze and visualize network data.",
        free: false,
        proOnly: true
      }
    ]
  },
  {
    name: "Learning & Research",
    routes: [
      {
        label: 'Study Assistant',
        icon: BookOpen,
        color: "text-purple-600",
        href: '/study',
        description: "Get help with studying and research.",
        free: false,
        proOnly: true
      },
      {
        label: 'Idea Generator',
        icon: Lightbulb,
        color: "text-yellow-600",
        href: '/ideas',
        description: "Generate creative ideas for any project.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_DAILY_LIMIT,
        featureType: FEATURE_TYPES.IDEA_GENERATOR
      }
    ]
  },
  {
    name: "System",
    routes: [
      {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        color: "text-gray-500",
        description: "Manage your account and preferences.",
        free: true
      },
      {
        label: 'History',
        icon: History,
        href: '/history',
        color: "text-gray-500",
        description: "View your conversation history.",
        free: true
      },
      {
        label: 'Affiliate',
        icon: Users,
        href: '/affiliate',
        color: "text-blue-500",
        description: "Access your affiliate dashboard.",
        free: true
      }
    ]
  }
];

interface SidebarProps {
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

const Sidebar = ({
  apiLimits = {},
  isPro = false
}: SidebarProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    const loadFeatureUsage = async () => {
      const usage: Record<string, number> = {};
      for (const category of routeCategories) {
        for (const route of category.routes) {
          if (route.featureType) {
            const count = await getFeatureUsage(route.featureType);
            usage[route.href] = count;
          }
        }
      }
      setFeatureUsage(usage);
    };
    loadFeatureUsage();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white overflow-y-auto">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            WorkFusion
          </h1>
        </Link>
        <div className="space-y-1">
          {routeCategories.map((category) => (
            <div key={category.name} className="mb-4">
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center w-full p-3 text-sm font-medium text-white hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                {expandedCategories.includes(category.name) ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                {category.name}
              </button>

              {expandedCategories.includes(category.name) && (
                <div className="mt-2">
                  {category.routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.proOnly && !isPro ? "/settings" : route.href}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                        pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                        route.proOnly && !isPro ? "opacity-75" : ""
                      )}
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                        {route.label}
                        {route.proOnly && !isPro && (
                          <ProLink href="/settings" isPro={isPro} isFree={false}>
                            <div className="ml-2 px-2 py-0.5 text-xs font-medium text-yellow-400 bg-yellow-400/10 rounded">
                              PRO
                            </div>
                          </ProLink>
                        )}
                        {route.limitedFree && !route.proOnly && !isPro && (
                          <div className="ml-auto text-xs">
                            {featureUsage[route.href] || 0}/{FREE_DAILY_LIMIT}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-3">
        {!isPro && (
          <Link 
            href="/settings" 
            className="w-full px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-sm font-semibold hover:opacity-90 transition flex items-center justify-center"
          >
            Upgrade to Pro
          </Link>
        )}
        <FreeCounter 
          apiLimits={apiLimits} 
          isPro={isPro}
        />
      </div>
    </div>
  );
};

export default Sidebar;
