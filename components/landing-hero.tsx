"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export const LandingHero = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const user = session?.user;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  }, []);

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center isolate text-foreground font-bold py-24 text-center space-y-16">
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Main Title and Typewriter Section */}
        <div className="flex flex-col items-center space-y-8 mb-12">
          <div className="inline-block">
            <span className="px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm text-sm font-medium mb-8 animate-fade-in">
              🚀 Welcome to the Future of AI
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl mx-auto animate-fade-in-up">
            {isSignedIn && user?.name
              ? `Welcome back, ${user.name}!`
              : "Transform Your Business with AI-Driven Solutions"}
          </h1>

          {/* Modified Video Section */}
          <div className="relative w-full max-w-3xl mt-8">
            <video
              ref={videoRef}
              className="w-full h-auto rounded-lg shadow-lg"
              poster="/videos/demo-thumbnail.jpg"
              muted
              autoPlay
              playsInline
            >
              <source src="/videos/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {showPlayButton && (
              <button
                onClick={handlePlayButtonClick}
                className="absolute inset-0 flex items-center justify-center"
                aria-label="Play video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>

          <p className="text-2xl font-semibold mt-4">
            Boost Efficiency and Innovation with Our Platform
          </p>

          <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black animate-fade-in-up-delayed">
            <TypewriterComponent
              options={{
                strings: [
                  "Generate Code",
                  "Create Content",
                  "Design Images",
                  "Build Apps",
                  "Analyze Data",
                  "Automate Tasks",
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 50,
                delay: 80,
              }}
            />
          </div>

          <p className="text-sm md:text-xl font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Experience the power of advanced AI models to boost your creativity,
            productivity, and innovation—no coding required.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up">
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <Button
              variant="premium"
              className="w-full sm:w-auto text-lg py-6 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {isSignedIn ? "Go to Dashboard" : "Join the Revolution"}
            </Button>
          </Link>

          <Link href="/docs">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-lg py-6 px-8 rounded-full font-semibold bg-secondary/80 backdrop-blur-sm hover:bg-secondary transition-all duration-300"
            >
              View Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
