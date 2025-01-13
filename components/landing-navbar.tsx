"use client";

import { useSession } from "next-auth/react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
// Removed 'useRouter' import as it's no longer needed

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const LandingNavbar = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  return (
    <nav className="p-4 bg-transparent flex items-center justify-between max-w-screen overflow-hidden">
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-8 mr-2 sm:mr-4 rounded-lg overflow-hidden bg-white/10 p-1 backdrop-blur-sm">
          <Image
            fill
            src="/logo.png"
            alt="Logo"
            sizes="(max-width: 32px) 100vw, 32px"
            className="object-contain"
          />
        </div>
        <h1
          className={cn(
            "hidden sm:block text-2xl font-bold text-white",
            font.className
          )}
        >
          workfusionapp
        </h1>
      </Link>
      <div className="flex items-center gap-x-2">
        <Link href="/pricing">
          <Button
            variant="premium"
            className="rounded-full text-sm sm:text-base px-3 sm:px-4"
          >
            <span className="hidden sm:inline">Upgrade</span>
            <span className="sm:hidden">Pro</span>
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </Link>
        {!isSignedIn && (
          <>
            <Link href="/sign-in">
              <Button variant="outline" className="rounded-full">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="rounded-full">Get Started</Button>
            </Link>
          </>
        )}
        {isSignedIn && (
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="rounded-full text-sm sm:text-base px-3 sm:px-4"
            >
              Dashboard
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};
