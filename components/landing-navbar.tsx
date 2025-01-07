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

  const onPrimaryAction = () => {
    if (session?.user) {
      router.push("/dashboard");
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

          <div className="flex items-center gap-x-4">
            {session?.user ? (
              <Button 
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Button 
                  onClick={onPrimaryAction}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Get Started
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
