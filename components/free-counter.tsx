"use client";

import { FC, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import { MAX_FREE_COUNTS, FREE_CONTENT_WORD_LIMIT, FREE_IDEA_LIMIT } from "@/constants";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface FreeCounterProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({ apiLimitCount = 0, isPro = false }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isPro) {
    return null;
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <p>
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Generations
              {apiLimitCount < MAX_FREE_COUNTS && (
                <span className="block text-xs text-gray-300 mt-1">
                  Free tier includes basic features with limits:
                  <ul className="mt-1 space-y-1">
                    <li>• {MAX_FREE_COUNTS} AI generations</li>
                    <li>• {FREE_CONTENT_WORD_LIMIT} words per content</li>
                    <li>• {FREE_IDEA_LIMIT} ideas per request</li>
                    <li>• Basic templates and styles</li>
                  </ul>
                </span>
              )}
            </p>
            <Progress className="h-3" value={(apiLimitCount / MAX_FREE_COUNTS) * 100} />
          </div>
          <Button variant="premium" className="w-full" onClick={() => router.push('/settings')}>
            Upgrade to WorkFusionApp Pro <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeCounter;
