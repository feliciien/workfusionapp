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
  transition: { duration: 0.8 }
};

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

  return (
    <div className='relative min-h-screen'>
      {/* Background Elements */}
      <div className='absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black' />
      <div className='absolute inset-0 bg-grid-white/[0.02]' />

      {/* Main Hero Section */}
      <section className='relative pt-32 pb-20'>
        <motion.div className='container mx-auto px-4 text-center' {...fadeIn}>
          <motion.span
            className='inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white backdrop-blur-sm mb-8'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}>
            🚀 L'IA du Futur est Là
          </motion.span>

          <motion.h1
            className='text-5xl md:text-7xl font-bold text-white mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            {isSignedIn
              ? `Bienvenue ${user?.name}!`
              : "Créez l'Impossible avec l'IA"}
          </motion.h1>

          {/* Video Demo */}
          <motion.div
            className='max-w-4xl mx-auto my-16'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}>
            <div className='rounded-2xl overflow-hidden shadow-2xl'>
              <video
                ref={videoRef}
                className='w-full'
                poster='/videos/demo-thumbnail.jpg'
                muted
                autoPlay
                playsInline
                loop>
                <source src='/videos/demo.mp4' type='video/mp4' />
              </video>
            </div>
          </motion.div>

          {/* Typewriter */}
          <div className='text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 my-8'>
            <TypewriterComponent
              options={{
                strings: [
                  "Intelligence Artificielle",
                  "Génération de Code",
                  "Création de Contenu",
                  "Analyse de Données"
                ],
                autoStart: true,
                loop: true
              }}
            />
          </div>

          {/* Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto my-20'>
            {[
              { number: "100K+", label: "Utilisateurs" },
              { number: "1M+", label: "Générations" },
              { number: "99%", label: "Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className='p-6 rounded-xl bg-white/5 backdrop-blur-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}>
                <h3 className='text-4xl font-bold text-purple-400'>
                  {stat.number}
                </h3>
                <p className='text-zinc-300'>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className='flex flex-col sm:flex-row items-center justify-center gap-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button className='w-full sm:w-auto text-lg px-8 py-6 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transform hover:scale-105 transition-all'>
                {isSignedIn ? "Accéder au Dashboard" : "Commencer Maintenant"}
              </Button>
            </Link>
            <Link href='/docs'>
              <Button
                variant='outline'
                className='w-full sm:w-auto text-lg px-8 py-6 rounded-full font-semibold border-2 border-white/20 hover:bg-white/10'>
                Documentation
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <section className='py-20 bg-black/50'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-2xl font-bold text-white mb-12'>
            Ils nous font confiance
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70'>
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`/logos/partner${i}.svg`}
                alt={`Partenaire ${i}`}
                className='h-12 w-auto'
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
