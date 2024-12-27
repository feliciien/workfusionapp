"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { tools } from "@/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const DashboardPage = () => {
  const { isLoaded, userId } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProStatus = async () => {
      if (!isLoaded || !userId) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/subscription");
        if (!response.ok) throw new Error('Failed to fetch subscription status');
        
        const data = await response.json();
        setIsPro(data.isPro);
        
        console.log("[DASHBOARD] Pro status:", {
          userId,
          isPro: data.isPro,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("[DASHBOARD] Error checking pro status:", error);
        setIsPro(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
  }, [isLoaded, userId]);

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore the power of AI
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          {isPro ? "Access all premium features with your Pro subscription" : "Chat with the smartest AI - Experience the power of AI"}
        </p>
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.free || isPro ? tool.href : "/settings"}
            className={cn(
              "block transition-opacity duration-200",
              (isLoading || (!tool.free && !isPro)) && "opacity-75"
            )}
          >
            <Card className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-8 h-8", tool.color)} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold">{tool.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  {!tool.free && !isPro && !isLoading && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Pro feature - Click to upgrade
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
