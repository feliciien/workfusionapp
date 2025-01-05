"use client";

import { FC, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { MAX_FREE_COUNTS } from "@/constants";
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

interface FreeCounterProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({ 
  apiLimitCount = 0,
  isPro = false 
}) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) {
    return null;
  }

  if (isPro) {
    return null;
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-sm text-center text-white mb-4 space-y-2">
            <p>
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Credits Used
            </p>
            <Progress
              className="h-3"
              value={(apiLimitCount / MAX_FREE_COUNTS) * 100}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => router.push('/settings')} 
                  variant="premium" 
                  className="w-full"
                  disabled={apiLimitCount < MAX_FREE_COUNTS}
                >
                  Upgrade
                  <Zap className="w-4 h-4 ml-2 fill-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Upgrade to SynthAI Pro to:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Remove all usage limits</li>
                    <li>Access premium features</li>
                    <li>Priority support</li>
                    <li>Early access to new features</li>
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
