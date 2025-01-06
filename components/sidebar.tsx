"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { FreeCounter } from "@/components/free-counter";
import { ProLink } from "@/components/pro-link";
import { FREE_LIMITS } from "@/constants";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const Sidebar = ({
  apiLimitCount = 0,
  isPro = false
}: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderToolItem = (route: any) => {
    const Icon = route.icon;
    const isActive = pathname === route.href;
    const usageCount = apiLimitCount;
    const usageLimit = route.limit || 0;
    const usagePercentage = Math.min((usageCount / usageLimit) * 100, 100);
    const remainingUses = Math.max(usageLimit - usageCount, 0);

    return (
      <Link
        key={route.href}
        href={route.href}
        className={cn(
          "relative group flex flex-col w-full rounded-lg transition",
          isActive ? "bg-white/10" : "hover:bg-white/5",
          !isPro && usageCount >= usageLimit && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-md", route.bgColor || "bg-white/5")}>
              <Icon className={cn("h-5 w-5", route.color)} />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium",
                isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
              )}>
                {route.label}
              </span>
              {!isPro && route.limit && (
                <span className="text-xs text-zinc-500">
                  {remainingUses} uses left
                </span>
              )}
            </div>
          </div>
          {!isPro && route.limit && (
            <div className="w-12 text-xs text-zinc-400">
              {usageCount}/{route.limit}
            </div>
          )}
        </div>
        {!isPro && route.limit && (
          <div className="px-3 pb-2">
            <Progress 
              value={usagePercentage} 
              className="h-1 bg-zinc-800"
              indicatorClassName={cn(
                usagePercentage >= 90 ? "bg-red-500" :
                usagePercentage >= 75 ? "bg-yellow-500" :
                "bg-blue-500"
              )}
            />
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Fixed Header */}
      <div className="px-3 py-4">
        <Link href="/dashboard" className="flex items-center pl-3">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/app-icon.svg" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            SynthAI
          </h1>
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 no-scrollbar">
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="space-y-8">
          {routes.map((category) => (
            <div key={category.category} className="space-y-3">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-3 flex items-center sticky top-0 bg-gray-900 py-2 z-10">
                <span>{category.category}</span>
                {!isPro && (
                  <span className="ml-auto text-[10px] text-zinc-500">
                    FREE LIMIT
                  </span>
                )}
              </h2>
              <div className="space-y-1">
                {category.items.map(renderToolItem)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <FreeCounter
          apiLimitCount={apiLimitCount}
          isPro={isPro}
        />
      </div>
    </div>
  );
};

export default Sidebar;