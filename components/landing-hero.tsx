"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Analytics } from "@vercel/analytics/react";
import { Button } from "./ui/button";

export const LandingHero = () => {
  const { isSignedIn, user } = useAuth();

  return (
    <div className="relative overflow-hidden isolate text-white font-bold py-36 text-center space-y-5">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-size-200 bg-pos-0"
        style={{
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      ></div>

      {/* Main Title and Typewriter Section */}
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>
          {isSignedIn && user?.firstName ? `Welcome back, ${user.firstName}!` : "The Best AI Tool for"}
        </h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: [
                "Chatbot.",
                "Photo Generation.",
                "Code Generation.",
                "Natural Language Processing.",
                "Voice Synthesis.",
                "Automated Testing.",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-sm md:text-xl font-light text-zinc-200">
        Create content and solutions using the power of AI.
      </div>

      {/* Call-to-Action */}
      <div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button variant="premium" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
            {isSignedIn ? "Go to Your Dashboard" : "Start Generating For Free"}
          </Button>
        </Link>
      </div>
      <div className="text-zinc-300 text-xs md:text-sm font-normal">
        No credit card required. Cancel anytime.
      </div>

      {/* Feature List Section */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-8">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg md:text-xl font-semibold">Cutting-Edge Models</h2>
          <p className="text-sm md:text-base font-light text-zinc-200">Utilize state-of-the-art AI for unparalleled results.</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg md:text-xl font-semibold">Seamless Integration</h2>
          <p className="text-sm md:text-base font-light text-zinc-200">Easily integrate into your existing workflows.</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-lg md:text-xl font-semibold">Scalable & Secure</h2>
          <p className="text-sm md:text-base font-light text-zinc-200">Grow your usage without compromising on security.</p>
        </div>
      </div>

      {/* Analytics */}
      <Analytics />
      
      {/* Add global styles for animation */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};