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
  Microscope,
  ChevronDown,
  ChevronRight
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
        freeLimit: FREE_LIMITS.PRESENTATION_SLIDES
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
        freeLimit: FREE_LIMITS.IDEA_LIMIT
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
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpanded(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredCategories = routeCategories.map(category => ({
    ...category,
    routes: category.routes.filter(route => 
      isPro || route.core || route.limitedFree || route.free
    )
  })).filter(category => category.routes.length > 0);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            SynthAI
          </h1>
        </Link>
        <div className="space-y-1">
          {filteredCategories.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                {category.name}
                {expanded.includes(category.name) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {expanded.includes(category.name) && (
                <div className="pl-6 space-y-1">
                  {category.routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                        pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                        !isPro && route.proOnly && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={(e) => {
                        if (!isPro && route.proOnly) {
                          e.preventDefault();
                          // You can add pro modal open here if needed
                        }
                      }}
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                        {route.label}
                      </div>
                      {(!isPro && route.proOnly) && (
                        <div className="ml-2 px-2 py-0.5 text-xs font-medium text-yellow-400 bg-yellow-400/10 rounded">
                          PRO
                        </div>
                      )}
                      {(!isPro && route.limitedFree) && (
                        <div className="ml-2 px-2 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded">
                          FREE TRIAL
                        </div>
                      )}
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
          <ProLink 
            href="/pro"
            isPro={isPro}
            isFree={false}
          />
        )}
        <FreeCounter 
          apiLimitCount={apiLimitCount} 
          isPro={isPro}
        />
      </div>
    </div>
  );
};

export default Sidebar;