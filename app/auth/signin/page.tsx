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
      // Redirect to Google sign-in
      signIn("google");
    }
    // If status is "loading", do nothing until we know the authentication status
  }, [status, signingIn]);

  // Optionally, render a loading indicator here
  return null;
}
