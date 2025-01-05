"use client";

import { useSession } from "next-auth/react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const LandingNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const onUpgradeClick = () => {
    if (session?.user) {
      router.push("/settings");
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#111827]/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-8 mr-4">
              <Image 
                fill 
                src="/logo.png" 
                alt="Logo"
                className="object-contain"
                sizes="(max-width: 32px) 100vw, 32px"
              />
            </div>
            <h1 className={cn("hidden sm:block text-xl font-bold text-white", font.className)}>
              WorkFusion
            </h1>
          </Link>

          <div className="flex items-center gap-x-2">
            {session?.user ? (
              <Button 
                onClick={() => router.push("/dashboard")}
                variant="default" 
                className="rounded-full"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => router.push("/auth/signin")}
                  variant="ghost" 
                  className="rounded-full text-white hover:text-white hover:bg-gray-700"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={onUpgradeClick}
                  variant="premium" 
                  className="rounded-full"
                >
                  <Zap className="w-4 h-4 mr-2 fill-white" />
                  <span>Upgrade</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
