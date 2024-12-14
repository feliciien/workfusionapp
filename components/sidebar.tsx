"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google';
import { usePathname } from "next/navigation";
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
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";

const montserrat = Montserrat ({ weight: '600', subsets: ['latin'] });

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500",
    description: "Overview of your AI workspace and activities."
  },
  {
    label: 'Conversation',
    icon: MessageSquare,
    href: '/conversation',
    color: "text-violet-500",
    description: "Chat seamlessly with our AI assistant to brainstorm ideas."
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    color: "text-pink-700",
    href: '/image',
    description: "Create unique images and illustrations from your prompts."
  },
  {
    label: 'Video Creation',
    icon: VideoIcon,
    color: "text-orange-700",
    href: '/video',
    description: "Convert text-based ideas into short, AI-generated videos."
  },
  {
    label: 'Code Generation',
    icon: Code,
    color: "text-green-700",
    href: '/code',
    description: "Generate code snippets, functions, or entire modules."
  },
  {
    label: 'Music Synthesis',
    icon: Music,
    color: "text-emerald-500",
    href: '/music',
    description: "Produce custom audio tracks suited for your projects."
  },
  {
    label: 'Voice Synthesis',
    icon: Mic2,
    color: "text-yellow-500",
    href: '/voice',
    description: "Generate voice samples and narrations in various styles."
  },
  {
    label: 'Art Generation',
    icon: Palette,
    color: "text-purple-700",
    href: '/art',
    description: "Craft stunning AI-assisted artwork and designs."
  },
  {
    label: 'Custom Models',
    icon: Brain,
    color: "text-blue-700",
    href: '/custom',
    description: "Train and configure your own AI models for specific tasks."
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: "text-gray-500",
    description: "Configure your AI workspace preferences."
  },
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

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
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
          {routes.map((route) => (
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
              {/* Show description on hover */}
              <div className="absolute left-full ml-2 p-2 bg-gray-900 rounded-md w-64 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 hidden lg:block">
                {route.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FreeCounter 
        apiLimitCount={apiLimitCount} 
        isPro={isPro}
      />
    </div>
  );
};

export default Sidebar;