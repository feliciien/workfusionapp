"use client";

import { signIn } from "next-auth/react";
import { Analytics } from '@vercel/analytics/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<string | boolean>(false);
  const router = useRouter();

  const handleSocialSignIn = async (provider: string) => {
    try {
      setIsLoading(provider);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Something went wrong with social sign in");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("credentials");
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sign up");
      }

      // Sign in the user after successful registration
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create an Account
          </h1>
          <p className="text-gray-500">
            Choose your preferred sign up method
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Enter your details below or continue with social
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social Sign In Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                disabled={!!isLoading}
                className="w-full"
              >
                {isLoading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="h-5 w-5 mr-2" />
                )}
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
                disabled={!!isLoading}
                className="w-full"
              >
                {isLoading === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FaGithub className="h-5 w-5 mr-2" />
                )}
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!isLoading}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!isLoading}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!isLoading}
                  required
                  className="w-full"
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full",
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                )}
                disabled={!!isLoading}
              >
                {isLoading === "credentials" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading === "credentials" ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="text-sm text-center w-full text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/sign-in" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
