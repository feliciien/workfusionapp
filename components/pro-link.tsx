"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProLinkProps {
  href: string;
  children: React.ReactNode;
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("[PRO_LINK] Click handler:", {
      href,
      isPro,
      isFree,
      shouldRedirect: !(isFree || isPro),
      timestamp: new Date().toISOString()
    });
    
    // If it's a free tool or user is pro, go to the tool
    // Otherwise, redirect to settings
    if (isFree || isPro) {
      console.log("[PRO_LINK] Navigating to tool:", href);
      router.push(href);
    } else {
      console.log("[PRO_LINK] Redirecting to settings");
      router.push("/settings");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        className,
        "cursor-pointer",
        (!isFree && !isPro) && "opacity-75"
      )}
    >
      {children}
    </div>
  );
};
