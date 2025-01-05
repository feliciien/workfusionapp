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
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/dashboard';

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading({ ...isLoading, [provider]: true });
    try {
      await signIn(provider, { callbackUrl });
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
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Failed to sign in with email:', error);
    } finally {
      setIsLoading({ ...isLoading, email: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="SynthAI Logo"
            width={150}
            height={150}
            className="mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400">
            {isSignUp
              ? 'Join the AI revolution today'
              : 'Sign in to continue to SynthAI'}
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading.google}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-lg p-3 font-medium hover:bg-gray-100 transition-colors"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            {isLoading.google ? 'Signing in...' : 'Continue with Google'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading.github}
            className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white rounded-lg p-3 font-medium hover:bg-[#2c3137] transition-colors"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={20}
              height={20}
            />
            {isLoading.github ? 'Signing in...' : 'Continue with GitHub'}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading.email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-3 font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              {isLoading.email ? 'Signing in...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
