"use client";

import { cn } from "@/lib/utils";
import { 
  Mic, 
  Music, 
  Settings, 
  VolumeX, 
  Volume2, 
  Download,
  History
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const routes = [
  {
    label: 'Text to Speech',
    icon: Music,
    href: '/voice',
    color: "text-violet-500",
  },
  {
    label: 'Voice Recording',
    icon: Mic,
    href: '/voice/recording',
    color: "text-pink-700",
  },
  {
    label: 'Voice Effects',
    icon: Volume2,
    href: '/voice/effects',
    color: "text-orange-700",
  },
  {
    label: 'Voice Mixer',
    icon: VolumeX,
    href: '/voice/mixer',
    color: "text-green-700",
  },
  {
    label: 'History',
    icon: History,
    href: '/voice/history',
    color: "text-blue-700",
  }
];

export const VoiceNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="p-3 space-y-4">
        {routes.map((route) => (
          <Button
            key={route.href}
            className={cn(
              "w-full justify-start pl-4 mb-1",
              pathname === route.href
                ? "bg-white/10"
                : "hover:bg-white/10 transition"
            )}
            variant="ghost"
            size="lg"
            onClick={() => {}}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
