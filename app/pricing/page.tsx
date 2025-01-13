"use client";

import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
// Removed `useSession` import as it's no longer needed

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <LandingNavbar />

      {/* Header */}
      <div className="py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600">
          Simple pricing for everyone. Upgrade to unlock premium features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md p-8 max-w-sm">
            <h2 className="text-3xl font-semibold mb-4">Free</h2>
            <p className="text-gray-600 mb-6">
              Get started with basic features.
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Access to essential AI tools
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Limited usage per day
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Community support
              </li>
            </ul>
            <Link href="/dashboard">
              <Button variant="default" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm border-2 border-indigo-600 transform scale-105">
            <h2 className="text-3xl font-semibold mb-4">Pro</h2>
            <p className="text-gray-600 mb-6">
              Unlock advanced features and priority support.
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Unlimited access to all tools
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Priority processing
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Premium AI models
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Dedicated support
              </li>
            </ul>
            <Link href="/settings">
              <Button variant="premium" className="w-full">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 text-center text-gray-500">
        <p>
          Need a custom plan?{" "}
          <a href="/contact" className="text-indigo-600 font-medium">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
