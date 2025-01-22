"use client";

import { FC, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { FREE_DAILY_LIMIT } from "@/constants";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ApiLimitData {
  count: number;
  limit: number;
  limits: {
    [key: string]: number;
  };
  remaining: number;
}

interface FreeCounterProps {
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({
  apiLimits = {},
  isPro = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [apiData, setApiData] = useState<ApiLimitData>({
    count: 0,
    limit: FREE_DAILY_LIMIT,
    limits: apiLimits,
    remaining: FREE_DAILY_LIMIT,
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await fetch("/api/api-limit");
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Failed to fetch API limits:", error);
      }
    };

    if (mounted && !isPro) {
      fetchLimits();
      // Refresh limits every 30 seconds
      const interval = setInterval(fetchLimits, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, isPro]);

  if (!mounted || status === "loading" || !session) {
    return null;
  }

  if (isPro) {
    return null;
  }

  const usagePercentage = ((FREE_DAILY_LIMIT - apiData.remaining) / FREE_DAILY_LIMIT) * 100;

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-sm text-center text-white mb-4 space-y-2">
            <p>
              {apiData.remaining} / {FREE_DAILY_LIMIT} Generations Remaining Today
            </p>
            <Progress
              className="h-3"
              value={usagePercentage}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => router.push("/pro")}
                  variant="premium"
                  className="w-full"
                >
                  Upgrade
                  <Zap className="w-4 h-4 ml-2 fill-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Upgrade to WorkFusion Pro to:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Get unlimited generations</li>
                    <li>Access premium features</li>
                    <li>Priority support</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
      <Analytics />
    </div>
  );
};

export default FreeCounter;
