"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProLinkProps {
  href: string;
  children?: React.ReactNode;
  isPro: boolean;
  isFree: boolean;
  className?: string;
}

export const ProLink = ({
  href,
  children,
  isPro,
  isFree,
  className
}: ProLinkProps) => {
  const router = useRouter();

  const proFeatures = [
    "Advanced Image Generation - Create stunning AI images",
    "Video Generation - Transform text into engaging videos",
    "Art Studio - Create digital art with AI assistance",
    "Music Creation - Compose original music and melodies",
    "Voice Synthesis - Generate natural-sounding narrations",
    "Content Writer - Generate unlimited articles and blogs",
    "Translation - Professional translation in multiple languages",
    "Code Analysis - Advanced code review and optimization",
    "Data Insights - Generate insights from your data",
    "Network Analysis - Analyze and visualize network data",
    "Custom Models - Train and customize AI models",
    "Unlimited API calls for all tools",
    "Priority support and early access to new features"
  ];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("[PRO_LINK] Click handler:", {
      href,
      isPro,
      isFree,
      shouldRedirect: !(isFree || isPro),
      timestamp: new Date().toISOString()
    });

    if (!(isFree || isPro)) {
      router.push(href);
    }
  };

  if (children) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={cn(
          "w-full",
          className
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
      <h3 className="text-sm font-semibold text-white mb-2">Upgrade to Pro</h3>
      <p className="text-xs text-zinc-400 mb-3">Unlock all premium features:</p>
      <div className="max-h-[300px] overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent">
        <ul className="space-y-2">
          {proFeatures.map((feature, index) => {
            const [title, description] = feature.split(" - ");
            return (
              <li key={index} className="text-xs text-zinc-300">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-2 flex-shrink-0 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <span className="font-medium text-white">{title}</span>
                    {description && (
                      <span className="text-zinc-400"> - {description}</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <button
        onClick={handleClick}
        className="w-full px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-sm font-semibold hover:opacity-90 transition"
      >
        Upgrade Now
      </button>
    </div>
  );
};
