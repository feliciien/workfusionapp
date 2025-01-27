"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TypewriterComponent from "typewriter-effect";
import { Button } from "./ui/button";

export const LandingHero = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";
  const user = session?.user;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay failure gracefully
        setShowPlayButton(true);
      });
      setShowPlayButton(false);
    }
  }, []);

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.error("Video playback failed");
      });
      setShowPlayButton(false);
    }
  };

  return (
    <div className='relative min-h-screen flex flex-col justify-center isolate text-foreground font-bold py-24 text-center space-y-16 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50 opacity-40' />
        <motion.div
          className='absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20'
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20'
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className='relative z-10 container mx-auto px-4'>
        {/* Main Title and Typewriter Section */}
        <motion.div
          className='flex flex-col items-center space-y-8 mb-12'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          <motion.div
            className='inline-block'
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <span className='px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-sm font-medium mb-8 animate-fade-in backdrop-blur-sm border border-gray-200/50 shadow-sm'>
              🚀 Welcome to the Future of AI
            </span>
          </motion.div>

          <motion.h1
            className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}>
            {isSignedIn && user?.name
              ? `Welcome back, ${user.name}!`
              : "Transform Your Business with AI-Driven Solutions"}
          </motion.h1>

          {/* Modified Video Section */}
          <motion.div
            className='relative w-full max-w-3xl mt-8'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}>
            <div className='rounded-2xl overflow-hidden shadow-2xl border border-gray-100'>
              <video
                ref={videoRef}
                className='w-full h-auto'
                poster='/videos/demo-thumbnail.jpg'
                muted
                autoPlay
                playsInline
                loop>
                <source src='/videos/demo.mp4' type='video/mp4' />
                Your browser does not support the video tag.
              </video>
              {showPlayButton && (
                <motion.button
                  onClick={handlePlayButtonClick}
                  className='absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300 hover:bg-black/40'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label='Play video'>
                  <motion.div
                    className='bg-white/90 rounded-full p-4 shadow-lg'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='40'
                      height='40'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='text-gray-900'>
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  </motion.div>
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.p
            className='text-2xl font-semibold mt-4 text-gray-800'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}>
            Boost Efficiency and Innovation with Our Platform
          </motion.p>

          <motion.div
            className='text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}>
            <TypewriterComponent
              options={{
                strings: [
                  "Generate Code",
                  "Create Content",
                  "Design Images",
                  "Build Apps",
                  "Analyze Data",
                  "Automate Tasks"
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 50,
                delay: 80
              }}
            />
          </motion.div>

          <motion.p
            className='text-sm md:text-xl font-light text-gray-600 max-w-2xl mx-auto leading-relaxed'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}>
            Experience the power of advanced AI models to boost your creativity,
            productivity, and innovation—no coding required.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className='flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}>
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant='premium'
                className='w-full sm:w-auto text-lg py-6 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'>
                {isSignedIn ? "Go to Dashboard" : "Join the Revolution"}
              </Button>
            </motion.div>
          </Link>

          <Link href='/docs'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant='outline'
                className='w-full sm:w-auto text-lg py-6 px-8 rounded-full font-semibold bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 border-2 border-gray-200 text-gray-800 shadow-md hover:shadow-lg'>
                View Documentation
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
