"use client";

import { Analytics } from "@vercel/analytics/react";
import { FC, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import FreeCounter from "./free-counter";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-yellow-500",
  },
  // Example route with notification badge
  {
    label: "Updates",
    icon: Bell,
    href: "/updates",
    color: "text-red-500",
    hasNotification: true,
  },
];

interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
  user?: User; // Made optional
}

const Sidebar: FC<SidebarProps> = ({
  apiLimitCount = 0,
  isPro = false,
  user,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-900 text-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <Image
                fill
                alt="Logo"
                src="/logo.png"
                className="rounded-full object-cover"
              />
            </div>
            <h1 className={cn("text-2xl font-bold", montserrat.className)}>
              WorkFusion
            </h1>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <div
              key={route.href}
              onClick={() => handleNavigation(route.href)}
              className={cn(
                "group flex items-center p-2 my-1 rounded-md cursor-pointer hover:bg-gray-800 relative",
                isActive ? "bg-gray-800" : ""
              )}
            >
              <Icon className={cn("w-6 h-6", route.color)} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">
                  {route.label}
                </span>
              )}
              {route.hasNotification && !isCollapsed && (
                <span className="ml-auto bg-red-500 text-xs rounded-full px-2 py-0.5">
                  New
                </span>
              )}
              {isCollapsed && (
                <span className="absolute left-20 bg-gray-800 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {route.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {/* Free Counter */}
        {!isCollapsed && (
          <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
        )}

        {/* User Profile */}
        {user && (
          <div className="mt-4 flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <Image
                fill
                alt="User Avatar"
                src={user.avatarUrl}
                className="rounded-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}
            {isCollapsed && (
              <span className="absolute left-20 bg-gray-800 text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {user.name}
              </span>
            )}
          </div>
        )}
      </div>

      <Analytics />
    </div>
  );
};

export default Sidebar;