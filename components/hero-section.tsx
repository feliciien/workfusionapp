'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

export const HeroSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      style={{ opacity, scale }} 
      className="relative min-h-[calc(100vh-4rem)] flex items-center"
    >
      {/* Loading Animation */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/40 animate-ping animation-delay-200" />
            <div className="absolute inset-4 rounded-full border-4 border-purple-500/60 animate-ping animation-delay-400" />
          </div>
        </div>
      )}

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-900/20" />
      
      {/* 3D Animation */}
      <div className="absolute inset-0 opacity-50 hidden md:block">
        <Canvas>
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <Sphere args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
              color="#4c1d95"
              attach="material"
              distort={0.5}
              speed={2}
            />
          </Sphere>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-purple-900/30 text-purple-300 ring-1 ring-inset ring-purple-700/30">
              New Features Available
              <span className="ml-2 h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.7 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto"
          >
            <span className="block">Transform Your Business with</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              AI-Powered Automation
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.9 }}
            className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 leading-relaxed"
          >
            Streamline operations, reduce costs, and drive innovation with our enterprise-grade AI platform.
            Built for modern businesses seeking intelligent automation solutions.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.1 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/get-started">
              <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-lg h-12 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/schedule-demo">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto text-lg h-12 px-8 border-purple-700 hover:bg-purple-700/20"
              >
                Schedule Demo
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.3 }}
            className="mt-8 sm:mt-12"
          >
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
