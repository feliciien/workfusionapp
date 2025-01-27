"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const LandingNavbar = () => {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  return (
    <nav className='p-4 bg-transparent flex items-center justify-between max-w-screen overflow-hidden'>
      <Link
        href='/'
        className='flex items-center group hover:opacity-90 transition-opacity'>
        <div className='relative h-8 w-8 mr-2 sm:mr-4 rounded-lg overflow-hidden bg-white/10 p-1 backdrop-blur-sm group-hover:bg-white/20 transition-colors'>
          <Image
            fill
            src='/logo.png'
            alt='Logo'
            sizes='(max-width: 32px) 100vw, 32px'
            className='object-contain'
          />
        </div>
        <h1
          className={cn(
            "hidden sm:block text-2xl font-bold text-white",
            font.className
          )}>
          workfusionapp
        </h1>
      </Link>
      <div className='flex items-center gap-x-4'>
        <Link href='/pricing' className='hidden sm:block'>
          <Button
            variant='ghost'
            className='text-white hover:text-white/90 hover:bg-white/10 transition-colors'>
            Pricing
          </Button>
        </Link>
        <Link href='/features' className='hidden sm:block'>
          <Button
            variant='ghost'
            className='text-white hover:text-white/90 hover:bg-white/10 transition-colors'>
            Features
          </Button>
        </Link>
        {!isSignedIn ? (
          <div className='flex items-center gap-x-2'>
            <Link href='/sign-in'>
              <Button
                variant='outline'
                className='rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors'>
                Sign in
              </Button>
            </Link>
            <Link href='/sign-up'>
              <Button
                variant='premium'
                className='rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'>
                Get Started Free
                <Zap className='w-4 h-4 ml-2 fill-white' />
              </Button>
            </Link>
          </div>
        ) : (
          <Link href='/dashboard'>
            <Button
              variant='premium'
              className='rounded-full text-sm sm:text-base px-6 py-2 font-semibold'>
              Dashboard
              <Zap className='w-4 h-4 ml-2 fill-white' />
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};
