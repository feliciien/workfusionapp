"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-6xl font-bold mb-12 text-center text-white">
          Welcome Back
        </h1>
        <Button
          onClick={() => signIn("google", { callbackUrl })}
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 flex items-center justify-center space-x-3 py-6 px-12 rounded-md shadow-lg"
        >
          <FcGoogle className="w-10 h-10" />
          <span className="text-2xl">Sign in with Google</span>
        </Button>
      </div>
    </div>
  );
}
