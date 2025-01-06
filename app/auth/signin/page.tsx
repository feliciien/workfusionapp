'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '/dashboard';

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading({ ...isLoading, [provider]: true });
    try {
      await signIn(provider, {
        callbackUrl: from,
        redirect: true,
      });
    } catch (error) {
      console.error(`Failed to sign in with ${provider}:`, error);
    } finally {
      setIsLoading({ ...isLoading, [provider]: false });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, email: true });
    try {
      await signIn('email', {
        email,
        callbackUrl: from,
        redirect: true,
      });
    } catch (error) {
      console.error('Failed to sign in with email:', error);
    } finally {
      setIsLoading({ ...isLoading, email: false });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 px-4 py-8 shadow-lg sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative h-16 w-16">
            <Image
              src="/app-icon.svg"
              alt="WorkFusion Logo"
              fill
              className="rounded-lg"
            />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-gray-400">
            Sign in to continue to SynthAI
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading['google']}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-600 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading['github']}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-600 bg-[#24292F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-2 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading['email']}
            className="flex w-full justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isLoading['email'] ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
