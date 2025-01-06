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

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
            <Image fill alt="Logo" src="/app-icon.svg" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            WorkFusion
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