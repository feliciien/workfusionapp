"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google';
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  Lightbulb,
  Languages,
  LineChart,
  BookOpen,
  ScrollText,
  Search,
  Microscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";
import { ProLink } from "@/components/pro-link";
import { getFeatureUsage } from "@/lib/feature-limit";
import { FREE_LIMITS, FEATURE_TYPES } from "@/constants";

const montserrat = Montserrat ({ weight: '600', subsets: ['latin'] });

interface RouteCategory {
  name: string;
  routes: Route[];
}

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
        freeLimit: FREE_LIMITS.CONTENT_WORD_LIMIT
      },
      {
        label: 'Translation',
        icon: Languages,
        color: "text-green-600",
        href: '/translation',
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
        freeLimit: 5
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
        freeLimit: 10
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
        label: 'Analytics Insights',
        icon: LineChart,
        color: "text-blue-500",
        href: '/analytics',
        description: "Generate insights from your data.",
        free: false,
        proOnly: true
      },
      {
        label: 'Presentation Creator',
        icon: PresentationIcon,
        color: "text-orange-600",
        href: '/presentation',
        description: "Create professional presentations instantly.",
        free: false,
        limitedFree: true,
        freeLimit: FREE_LIMITS.PRESENTATION_SLIDES
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
        freeLimit: FREE_LIMITS.IDEA_LIMIT
      }
    ]
  },
  {
    name: "System",
    routes: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: "text-sky-500",
        description: "Overview of your AI workspace and activities.",
        free: true,
        core: true
      },
      {
        label: 'History',
        icon: History,
        href: '/history',
        color: "text-indigo-500",
        description: "View your past conversations and interactions.",
        free: true,
        core: true
      },
      {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        color: "text-gray-500",
        description: "Manage your account settings and preferences.",
        free: true,
        core: true
      }
    ]
  }
];

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

const Sidebar = ({
  apiLimitCount = 0,
  isPro = false
}: SidebarProps) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadFeatureUsage = async () => {
      const usage: FeatureUsage = {};
      for (const type of Object.values(FEATURE_TYPES)) {
        usage[type] = await getFeatureUsage(type);
      }
      setFeatureUsage(usage);
    };

    if (!isPro) {
      loadFeatureUsage();
    }
  }, [isPro]);

  const getRemainingUsage = (featureType: string): number => {
    if (isPro) return Infinity;
    const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS] || 0;
    const used = featureUsage[featureType] || 0;
    return Math.max(0, limit - used);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            WorkFusion
          </h1>
        </Link>
        <div className="space-y-6">
          {routeCategories.map((category) => (
            <div key={category.name}>
              <h2 className="text-xs uppercase text-gray-400 font-bold px-4 mb-2">
                {category.name}
              </h2>
              <div className="space-y-1">
                {category.routes.map((route) => (
                  <div key={route.href}>
                    {route.proOnly && !isPro ? (
                      <ProLink
                        href={route.href}
                        isPro={isPro}
                        isFree={false}
                      >
                        <div
                          className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                            "text-zinc-400",
                          )}
                        >
                          <div className="flex items-center flex-1">
                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                            <div className="flex-1">{route.label}</div>
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                              PRO
                            </span>
                          </div>
                        </div>
                      </ProLink>
                    ) : route.limitedFree ? (
                      <Link
                        href={route.href}
                        className={cn(
                          "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                          pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                        )}
                      >
                        <div className="flex items-center flex-1">
                          <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                          <div className="flex-1">{route.label}</div>
                          <div className="text-xs text-gray-500">
                            {getRemainingUsage(route.label.toLowerCase().replace(/\s+/g, '_'))}/
                            {route.freeLimit} free
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href={route.href}
                        className={cn(
                          "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                          pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                        )}
                      >
                        <div className="flex items-center flex-1">
                          <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                          {route.label}
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!isPro && (
        <div className="px-3">
          <FreeCounter 
            apiLimitCount={apiLimitCount}
            isPro={isPro}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;