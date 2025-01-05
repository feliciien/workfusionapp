"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const LandingHero = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <div className="text-center space-y-12 py-36 md:py-64">
      <div className="space-y-8">
        <motion.h1 
          className="text-4xl sm:text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Transform Your Business
          <br />
          with Advanced{" "}
          <span className="text-purple-600">
            <TypewriterComponent
              options={{
                strings: [
                  "AI",
                  "Automation",
                  "Analytics",
                  "Intelligence",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </span>
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          WorkFusion empowers your business with cutting-edge AI solutions.
          <br className="hidden md:block" />
          Automate tasks, generate content, and boost productivity.
        </motion.p>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="premium"
                className="text-lg p-6 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button
                  variant="premium"
                  className="text-lg p-6 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  className="text-lg p-6 rounded-full font-semibold border-2 hover:bg-gray-100/50"
                >
                  Learn More
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Lightning Fast</h3>
          <p className="text-gray-600 text-center">
            Get instant results with our optimized AI processing
          </p>
        </div>

        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Secure & Private</h3>
          <p className="text-gray-600 text-center">
            Enterprise-grade security for your sensitive data
          </p>
        </div>

        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Easy to Use</h3>
          <p className="text-gray-600 text-center">
            Intuitive interface designed for all skill levels
          </p>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        className="mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p className="text-sm text-gray-500 mb-6">TRUSTED BY LEADING COMPANIES</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          {/* Add company logos here */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-32 h-12 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};