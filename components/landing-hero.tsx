/** @format */

"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TypewriterComponent from "typewriter-effect";
import { Button } from "./ui/button";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

export const LandingHero = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const user = session?.user;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Main Hero Section */}
      <section className="relative pt-32 pb-20">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="initial"
          animate="animate"
          {...fadeIn}
        >
          <motion.span
            className="inline-block px-6 py-3 rounded-full bg-secondary/80 backdrop-blur-sm text-sm font-medium mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            🚀 Welcome to the Future of AI
          </motion.span>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSignedIn && user?.name
              ? `Welcome back, ${user.name}!`
              : "Transform Your Business with AI-Driven Solutions"}
          </motion.h1>

          {/* Video Demo */}
          <motion.div
            className="relative w-full max-w-3xl mt-8 mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                className="w-full h-auto"
                poster="/videos/demo-thumbnail.jpg"
                muted
                autoPlay
                playsInline
                loop
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
          </motion.div>

          <motion.p
            className="text-2xl font-semibold mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Boost Efficiency and Innovation with Our Platform
          </motion.p>

          {/* Typewriter Effect */}
          <motion.div
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TypewriterComponent
              options={{
                strings: [
                  "Artificial Intelligence",
                  "Code Generation",
                  "Content Creation",
                  "Data Analysis",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-12">
            Trusted by Thousands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { number: "100K+", label: "Users" },
              { number: "1M+", label: "Generations" },
              { number: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm"
              >
                <h3 className="text-4xl font-bold text-purple-400">
                  {stat.number}
                </h3>
                <p className="text-zinc-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-12">
            Our Valued Partners
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`/logos/partner${i}.svg`}
                alt={`Partner ${i}`}
                className="h-12 w-auto"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
