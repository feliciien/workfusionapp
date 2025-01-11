"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap, Crown, Star, Lock } from "lucide-react";
import { tools, routeCategories } from "./config";
import { MAX_FREE_COUNTS } from "@/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiLimitCount, setApiLimitCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);
        const [subResponse, limitResponse] = await Promise.all([
          fetch("/api/subscription"),
          fetch("/api/api-limit"),
        ]);

        if (!subResponse.ok || !limitResponse.ok) {
          throw new Error("Failed to fetch status");
        }

        const [subData, limitData] = await Promise.all([
          subResponse.json(),
          limitResponse.json(),
        ]);

        setIsPro(subData.isPro);
        setApiLimitCount(limitData.count || 0);
      } catch (error) {
        console.error("[DASHBOARD] Error checking status:", error);
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [status]);

  const getFreeProgress = () => {
    return Math.min((apiLimitCount / MAX_FREE_COUNTS) * 100, 100);
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  const usedGenerations = apiLimitCount;
  const remainingGenerations = Math.max(MAX_FREE_COUNTS - usedGenerations, 0);

  return (
    <div className="px-4 lg:px-8">
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-violet-500 to-indigo-500 text-transparent bg-clip-text">
          Welcome to WorkFusion
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          {isPro ? (
            <span className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Access all premium features with your Pro subscription
            </span>
          ) : (
            "Experience the power of AI - Upgrade to Pro for unlimited access"
          )}
        </p>
      </div>

      {!isPro && (
        <Card className="p-4 border-yellow-500/20 bg-yellow-500/10 mb-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-yellow-800">Free Tier Usage</p>
              <div className="text-xs text-yellow-800 flex items-center gap-2">
                <span>{usedGenerations} used</span>
                <span>/</span>
                <span>{MAX_FREE_COUNTS} generations</span>
              </div>
            </div>
            <Progress value={getFreeProgress()} className="h-2" />
            <p className="text-xs text-yellow-800 text-right">
              {remainingGenerations} generations remaining
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {routeCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{category.name}</h3>
            <div className="space-y-2">
              {category.routes.map((tool) => {
                const isProTool = tool.proOnly;
                const isAccessible = isPro || (!isProTool && remainingGenerations > 0);

                return (
                  <Link
                    key={tool.href}
                    href={isAccessible ? tool.href : "/settings"}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-all",
                      isAccessible
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "opacity-70 cursor-not-allowed bg-muted/20",
                      tool.limitedFree && !isPro && remainingGenerations > 0 && "border border-yellow-500/20"
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                        <tool.icon className={cn("w-5 h-5", tool.color)} />
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {tool.label}
                          {(!isAccessible || (isProTool && !isPro)) && (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    {tool.limitedFree && !isPro && remainingGenerations > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3" />
                        <span>{Math.min(tool.freeLimit || 0, remainingGenerations)} available</span>
                      </div>
                    ) : (
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!isPro && (
        <Card className="p-6 bg-gradient-to-r from-violet-500 to-indigo-500 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Upgrade to Pro</h3>
              <p className="text-white/80">Unlock unlimited access to all features</p>
            </div>
            <Link href="/settings">
              <Button variant="premium" className="bg-white text-violet-500 hover:bg-white/90">
                <Zap className="w-4 h-4 mr-2 fill-violet-500" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
