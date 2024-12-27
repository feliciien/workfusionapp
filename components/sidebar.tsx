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
  Moon,
  Sun,
  Network,
  Lock,
  FileText,
  PresentationIcon,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";
import { ProLink } from "@/components/pro-link";
import { getFeatureUsage } from "@/lib/feature-limit";
import { FREE_LIMITS, FEATURE_TYPES } from "@/constants";

const montserrat = Montserrat ({ weight: '600', subsets: ['latin'] });

interface FeatureUsage {
  [key: string]: number;
}

const routes = [
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
    label: 'Network Monitor',
    icon: Network,
    href: '/network',
    color: "text-emerald-500",
    description: "Monitor and analyze network performance metrics.",
    free: false,
    proOnly: true
  },
  {
    label: 'Conversation',
    icon: MessageSquare,
    href: '/conversation',
    color: "text-violet-500",
    description: "Chat seamlessly with our AI assistant to brainstorm ideas.",
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
    label: 'Image Generation',
    icon: ImageIcon,
    color: "text-pink-700",
    href: '/image',
    description: "Generate unique images using AI",
    free: false,
    limitedFree: true,
    freeLimit: 5
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    color: "text-orange-700",
    href: '/video',
    description: "Convert text-based ideas into short, AI-generated videos.",
    free: false,
    proOnly: true
  },
  {
    label: 'Code Generation',
    icon: Code,
    color: "text-green-700",
    href: '/code',
    description: "Generate code snippets, functions, or entire modules.",
    free: false,
    limitedFree: true,
    freeLimit: 10
  },
  {
    label: 'Music Synthesis',
    icon: Music,
    color: "text-emerald-500",
    href: '/music',
    description: "Produce custom audio tracks suited for your projects.",
    free: false,
    proOnly: true
  },
  {
    label: 'Voice Synthesis',
    icon: Mic2,
    color: "text-yellow-500",
    href: '/voice',
    description: "Generate voice samples and narrations in various styles.",
    free: false,
    limitedFree: true,
    freeLimit: 5
  },
  {
    label: 'Art Generation',
    icon: Palette,
    color: "text-purple-700",
    href: '/art',
    description: "Craft stunning AI-assisted artwork and designs.",
    free: false,
    proOnly: true
  },
  {
    label: 'Custom Models',
    icon: Brain,
    color: "text-blue-700",
    href: '/custom-models',
    description: "Train and deploy custom AI models.",
    free: false,
    proOnly: true
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

  const getRemainingUsage = (featureType: string) => {
    if (isPro) return "∞";
    const limit = FREE_LIMITS[featureType.toUpperCase() as keyof typeof FREE_LIMITS];
    const used = featureUsage[featureType] || 0;
    return Math.max(0, limit - used);
  };

  if (!isMounted) {
    return null;
  }

  const coreFeatures = routes.filter(route => route.core);
  const limitedFreeFeatures = routes.filter(route => route.limitedFree);
  const proOnlyFeatures = routes.filter(route => route.proOnly);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            workfusionapp
          </h1>
        </Link>
        <div className="space-y-1">
          {/* Core Features */}
          <h2 className="text-xs uppercase text-zinc-400 font-bold pl-4 mb-2">
            Core Features
          </h2>
          {coreFeatures.map((route) => (
            <Link
              key={route.href} 
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
          ))}

          {/* Limited Free Features */}
          <h2 className="text-xs uppercase text-zinc-400 font-bold pl-4 mb-2 mt-6">
            Limited Free Features
          </h2>
          {limitedFreeFeatures.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                <div>
                  {route.label}
                  {route.freeLimit && (
                    <span className="text-xs text-zinc-400 block">
                      {getRemainingUsage(route.href.replace("/", ""))}/{route.freeLimit} free uses
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Pro-Only Features */}
          <h2 className="text-xs uppercase text-zinc-400 font-bold pl-4 mb-2 mt-6">
            Pro Features
          </h2>
          {proOnlyFeatures.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
                {!isPro && (
                  <ProLink 
                    href={route.href}
                    isPro={isPro}
                    isFree={false}
                  >
                    <span className="ml-2 text-xs text-zinc-400">PRO</span>
                  </ProLink>
                )}
              </div>
            </Link>
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