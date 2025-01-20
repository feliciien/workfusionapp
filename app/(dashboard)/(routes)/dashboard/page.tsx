"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Zap,
  Crown,
  Star,
  Lock,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { tools, routeCategories } from "./config";
import { MAX_FREE_COUNTS } from "@/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Import additional components for onboarding and metrics
// (Assuming these components exist or will be created)
import OnboardingTips from "@/components/onboarding-tips";
import MetricsOverview from "@/components/metrics-overview";

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiLimitCount, setApiLimitCount] = useState(0);
  const [userName, setUserName] = useState("");

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
        setUserName(session.user?.name || "");
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
    <div className="px-4 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl md:text-5xl font-bold">
          {userName ? `Welcome back, ${userName}!` : "Welcome to Your AI Dashboard"}
        </h2>
        <p className="mt-2 text-lg">
          Empowering you with cutting-edge AI tools to revolutionize your workflow.
        </p>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview isPro={isPro} />

      {/* Onboarding Tips */}
      {!isPro && <OnboardingTips />}

      {/* Tools Section */}
      <div className="space-y-6">
        {routeCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.routes.map((tool) => {
                const isProTool = tool.proOnly;
                const isAccessible =
                  isPro || (!isProTool && remainingGenerations > 0);

                return (
                  <Link
                    key={tool.href}
                    href={isAccessible ? tool.href : "/settings"}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-all",
                      isAccessible
                        ? "hover:bg-muted/50 cursor-pointer bg-white shadow"
                        : "opacity-70 cursor-not-allowed bg-muted/20",
                      tool.limitedFree &&
                        !isPro &&
                        remainingGenerations > 0 &&
                        "border border-yellow-500/20"
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <div
                        className={cn(
                          "p-2 w-fit rounded-md",
                          tool.bgColor
                        )}
                      >
                        <tool.icon
                          className={cn("w-6 h-6", tool.color)}
                        />
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {tool.label}
                          {(!isAccessible || (isProTool && !isPro)) && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    {tool.limitedFree && !isPro && remainingGenerations > 0 ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span>
                          {Math.min(
                            tool.freeLimit || 0,
                            remainingGenerations
                          )}{" "}
                          available
                        </span>
                      </div>
                    ) : (
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade to Pro Section */}
      {!isPro && (
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-8 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Unlock Full Potential</h3>
              <p className="text-white/80">
                Upgrade to Pro for unlimited access to all features.
              </p>
            </div>
            <Link href="/settings">
              <Button
                variant="premium"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                <Zap className="w-5 h-5 mr-2 fill-purple-600" />
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
