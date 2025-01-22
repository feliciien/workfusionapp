// app/auth/signin/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SignInPage />
    </Suspense>
  );
}

function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      // User is signed in, redirect to dashboard
      router.replace("/dashboard");
      // Remove the referralCode cookie
      Cookies.remove("referralCode");
    } else if (status === "unauthenticated" && !signingIn) {
      const referralCode = searchParams.get("referralCode");
      if (referralCode) {
        // Store the referral code in a cookie for later retrieval
        Cookies.set("referralCode", referralCode, { expires: 7 });
      }

      setSigningIn(true);
      // Initiate Google sign-in with error handling
      signIn("google", {
        callbackUrl: "/dashboard",
      }).catch((err) => {
        setError("An error occurred during sign in. Please try again.");
        setSigningIn(false);
        console.error("Sign in error:", err);
      });
    }
  }, [status, signingIn, router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setSigningIn(false);
            }}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-red-900 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while authentication is in progress
  if (status === "loading" || signingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  return null;
}
