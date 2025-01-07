'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function VerifyRequest() {
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
            Check your email
          </h2>
          <p className="text-center text-sm text-gray-400">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-gray-400">
            Click the link in the email to sign in. If you don't see it, check your spam folder.
          </p>
          <Link
            href="/auth/signin"
            className="flex w-full justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
