"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import TypewriterComponent from "typewriter-effect";
import { Analytics } from "@vercel/analytics/react";
import { Button } from "./ui/button";

export const LandingHero = () => {
  const { isSignedIn, user } = useUser();

  return (
    <div className="relative overflow-hidden isolate text-white font-bold py-36 text-center space-y-16">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-size-200 bg-pos-0"
        style={{
          backgroundSize: "400% 400%",
          animation: "gradientShift 20s ease-in-out infinite",
        }}
      ></div>

      {/* Main Title and Typewriter Section */}
      <div className="flex flex-col items-center space-y-6 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
          {isSignedIn && user?.firstName
            ? `Welcome back, ${user.firstName}!`
            : "Empower Your Projects with AI"}
        </h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
          <TypewriterComponent
            options={{
              strings: [
                "Chatbots",
                "Photo Generation",
                "Code Generation",
                "NLP",
                "Voice Synthesis",
                "Automated Testing",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
        <p className="text-sm md:text-xl font-light text-zinc-200 max-w-2xl leading-relaxed">
          Harness cutting-edge AI to boost creativity, productivity, and innovation—no coding skills required.
        </p>
      </div>

      {/* Primary Call-to-Action */}
      <div className="flex flex-col items-center space-y-4">
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button 
            variant="premium" 
            className="md:text-lg py-4 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {isSignedIn ? "Access Your Dashboard" : "Get Started for Free"}
          </Button>
        </Link>
        <Link href="/docs">
          <span className="text-zinc-300 text-sm md:text-base font-normal underline cursor-pointer hover:text-zinc-100 transition-colors">
            Learn more in our documentation
          </span>
        </Link>
        <p className="text-zinc-300 text-xs md:text-sm font-normal">
          No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Credibility Statement */}
      <div className="mt-10 text-zinc-200 text-sm md:text-base font-light">
        Trusted by over <span className="font-semibold text-white">10,000 creators</span> worldwide.
      </div>

      {/* How It Works Section */}
      <div className="mt-20 px-8 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-100 mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Glass-like Card */}
          <div className="flex flex-col space-y-3 p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-icons-outlined text-pink-300">edit</span>
              1. Define Your Goal
            </h3>
            <p className="text-sm font-light text-zinc-200 leading-relaxed">
              Describe what you want to create—content, visuals, or code—and let our AI interpret your needs instantly.
            </p>
          </div>

          <div className="flex flex-col space-y-3 p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-icons-outlined text-pink-300">rocket_launch</span>
              2. AI-Powered Generation
            </h3>
            <p className="text-sm font-light text-zinc-200 leading-relaxed">
              Our state-of-the-art models produce high-quality, accurate outputs tailored precisely to your requirements.
            </p>
          </div>

          <div className="flex flex-col space-y-3 p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-icons-outlined text-pink-300">check_circle</span>
              3. Refine & Integrate
            </h3>
            <p className="text-sm font-light text-zinc-200 leading-relaxed">
              Fine-tune results effortlessly and deploy them into your workflow. Save time and enhance your output.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-20 px-8 max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-100 mb-8">Key Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-zinc-200">
          <div className="flex flex-col items-center space-y-2 text-center">
            <span className="material-icons-outlined text-3xl text-pink-300">flash_on</span>
            <h3 className="text-lg font-semibold text-white">Lightning Fast</h3>
            <p className="text-sm font-light">Generate results instantly and accelerate your projects.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <span className="material-icons-outlined text-3xl text-pink-300">security</span>
            <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
            <p className="text-sm font-light">Your data is always protected, ensuring peace of mind.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <span className="material-icons-outlined text-3xl text-pink-300">palette</span>
            <h3 className="text-lg font-semibold text-white">Versatile & Creative</h3>
            <p className="text-sm font-light">Adapt to numerous use-cases, from art to code, with ease.</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-16 flex justify-center">
        <div className="flex flex-col items-center space-y-2 text-zinc-200">
          <span>Scroll down</span>
          <span className="material-icons-outlined text-pink-300 animate-bounce">expand_more</span>
        </div>
      </div>

      {/* Analytics */}
      <Analytics />

      {/* Global styles */}
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

        .material-icons-outlined {
          font-family: 'Material Icons Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: inherit;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
};