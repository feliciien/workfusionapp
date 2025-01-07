"use client";

import { categories } from "./config";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const DashboardPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPro, setIsPro] = useState<boolean>(false);
  const [apiLimitCount, setApiLimitCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

        const [proStatus, count] = await Promise.all([
          checkSubscription(session.user.id),
          getApiLimitCount(session.user.id)
        ]);

        setIsPro(proStatus);
        if (!proStatus) {
          setApiLimitCount(count || 0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const remainingGenerations = 5 - apiLimitCount;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Hero Section */}
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
          Welcome to Your AI Workspace
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Unlock the power of AI with our comprehensive suite of tools
        </p>
      </div>

      {/* Pro Badge for subscribers */}
      {isPro && (
        <div className="px-4 md:px-20 lg:px-32 mb-8">
          <div className="flex items-center gap-x-2 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <p className="text-purple-700 dark:text-purple-300 font-medium">
              Pro Subscription Active - Enjoy unlimited access to all features
            </p>
          </div>
        </div>
      )}

      {/* Free tier progress - Only show for non-Pro users */}
      {!isPro && remainingGenerations < 5 && (
        <div className="px-4 md:px-20 lg:px-32 mb-8">
          <Card className="p-6 border-black/5 flex items-center justify-between bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-2">
              <p className="text-sm font-medium">Free Plan Usage</p>
              <div className="flex items-center gap-x-2">
                <Progress 
                  className="h-2 w-[200px]" 
                  value={(remainingGenerations / 5) * 100}
                />
                <span className="text-xs text-muted-foreground">
                  {remainingGenerations}/5 generations left
                </span>
              </div>
            </div>
            <Link href="/settings">
              <button className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all hover:shadow-lg">
                Upgrade to Pro
              </button>
            </Link>
          </Card>
        </div>
      )}

      {/* Tools Grid */}
      <div className="px-4 md:px-20 lg:px-32 space-y-8">
        {categories.map((category) => (
          <div key={category.name} className="space-y-4">
            <div className="flex items-center gap-x-3 mb-4">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.routes.map((tool) => {
                const isBasicTool = tool.label === "Dashboard" || tool.label === "Settings";
                const isProTool = tool.proOnly;
                
                return (
                  <Card
                    key={tool.href}
                    className="group relative p-6 border-black/5 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => router.push(tool.href)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                          <tool.icon className={cn("w-6 h-6", tool.color)} />
                        </div>
                        {isProTool && !isPro && (
                          <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-300">
                            PRO
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 group-hover:text-purple-700 transition-colors">
                          {tool.label}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      {tool.limitedFree && !isPro && remainingGenerations > 0 && (
                        <div className="flex items-center gap-x-2 mt-4 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span>{Math.min(tool.freeLimit || 0, remainingGenerations)} free generations available</span>
                        </div>
                      )}
                      <div className="mt-auto pt-4 flex justify-end">
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
