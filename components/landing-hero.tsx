"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Button } from "./ui/button";

export const LandingHero = () => {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen flex flex-col justify-center isolate text-white font-bold py-24 text-center space-y-16">
      {/* Animated gradient background with floating shapes */}
      <div
        className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-size-200 bg-pos-0 overflow-hidden"
        style={{
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease-in-out infinite",
        }}
      >
        {/* Add floating shapes for visual interest */}
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-overlay animate-float"
              style={{
                width: Math.random() * 300 + 50 + "px",
                height: Math.random() * 300 + 50 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                background: `rgba(255, 255, 255, ${Math.random() * 0.3})`,
                animationDelay: Math.random() * 5 + "s",
                animationDuration: Math.random() * 10 + 20 + "s",
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6 text-center px-4 md:px-6 relative z-10">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
          The Best AI Tool for
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            <TypewriterComponent
              options={{
                strings: [
                  "Chatbot Creation.",
                  "Code Generation.",
                  "Photo Generation.",
                  "Music Creation.",
                  "Video Generation.",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </span>
        </h1>
        <p className="text-zinc-200 text-lg md:text-xl font-normal max-w-3xl mx-auto">
          Create content using AI 10x faster with our intuitive platform.
          High-quality AI tools for code, images, videos, and more.
        </p>

        <div className="flex justify-center gap-4">
          {session?.user ? (
            <Link href="/dashboard">
              <Button
                variant="premium"
                className="text-lg md:text-xl p-6 rounded-full font-semibold"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button
                variant="premium"
                className="text-lg md:text-xl p-6 rounded-full font-semibold"
              >
                Start Creating For Free
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};