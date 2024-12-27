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

const montserrat = Montserrat ({ weight: '600', subsets: ['latin'] });

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500",
    description: "Overview of your AI workspace and activities.",
    free: true
  },
  {
    label: 'Network Monitor',
    icon: Network,
    href: '/network',
    color: "text-emerald-500",
    description: "Monitor and analyze network performance metrics.",
    free: false
  },
  {
    label: 'Conversation',
    icon: MessageSquare,
    href: '/conversation',
    color: "text-violet-500",
    description: "Chat seamlessly with our AI assistant to brainstorm ideas.",
    free: true
  },
  {
    label: 'History',
    icon: History,
    href: '/history',
    color: "text-indigo-500",
    description: "View your past conversations and interactions.",
    free: true
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    color: "text-pink-700",
    href: '/image',
    description: "Generate unique images using AI",
    free: false,
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    color: "text-orange-700",
    href: '/video',
    description: "Convert text-based ideas into short, AI-generated videos.",
    free: false
  },
  {
    label: 'Code Generation',
    icon: Code,
    color: "text-green-700",
    href: '/code',
    description: "Generate code snippets, functions, or entire modules.",
    free: false,
  },
  {
    label: 'Music Synthesis',
    icon: Music,
    color: "text-emerald-500",
    href: '/music',
    description: "Produce custom audio tracks suited for your projects.",
    free: false
  },
  {
    label: 'Voice Synthesis',
    icon: Mic2,
    color: "text-yellow-500",
    href: '/voice',
    description: "Generate voice samples and narrations in various styles.",
    free: false,
  },
  {
    label: 'Art Generation',
    icon: Palette,
    color: "text-purple-700",
    href: '/art',
    description: "Craft stunning AI-assisted artwork and designs.",
    free: false,
  },
  {
    label: 'Custom Models',
    icon: Brain,
    color: "text-blue-700",
    href: '/custom-models',
    description: "Train and deploy custom AI models.",
    free: false
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: "text-gray-500",
    description: "Manage your account settings and preferences.",
    free: true
  }
];

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

const Sidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: SidebarProps) => {
  const pathname = usePathname();
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage first, then system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (storedTheme === null && prefersDark);
    
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4 rounded-lg overflow-hidden bg-white/10 p-1 backdrop-blur-sm">
            <Image 
              fill 
              alt="Logo" 
              src="/logo.png"
              sizes="(max-width: 32px) 100vw, 32px"
              className="object-contain" 
            />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            workfusionapp
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <ProLink
              key={route.href}
              href={route.href}
              isPro={isPro}
              isFree={route.free}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                <div>
                  {route.label}
                </div>
              </div>
              {!route.free && !isPro && (
                <Lock className="h-4 w-4 text-zinc-400" />
              )}
              {hoveredRoute === route.href && (
                <div className="absolute left-full ml-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg z-50 w-48">
                  {route.description}
                  {!route.free && !isPro && (
                    <div className="mt-1 text-xs text-yellow-400">
                      Pro feature - <Link href="/settings" className="underline hover:text-yellow-300">Upgrade to access</Link>
                    </div>
                  )}
                </div>
              )}
            </ProLink>
          ))}
          <button
            onClick={toggleDarkMode}
            className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
          >
            <div className="flex items-center flex-1">
              {darkMode ? (
                <Sun className="h-5 w-5 mr-3 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 mr-3 text-blue-500" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </div>
          </button>
        </div>
      </div>

      <div className="mt-auto px-3">
        {!isPro && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            <p className="text-white text-sm mb-2">
              Upgrade to Pro for unlimited access
            </p>
            <Link
              href="/settings"
              className="w-full bg-white text-black rounded-lg p-2 text-center text-sm font-medium hover:bg-gray-100 transition"
            >
              Upgrade Now
            </Link>
          </div>
        )}
        <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
      </div>
    </div>
  );
};

export default Sidebar;