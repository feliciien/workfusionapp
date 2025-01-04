"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              {error === "Callback"
                ? "There was a problem with the authentication callback. This might be due to misconfigured OAuth settings."
                : error || "An unknown error occurred during authentication."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild>
              <Link href="/auth/signin">
                Try Again
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
