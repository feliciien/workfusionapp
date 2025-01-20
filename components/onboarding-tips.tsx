"use client";

import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const OnboardingTips = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <UserPlus className="w-8 h-8 text-green-500 mr-2" />
        <h3 className="text-xl font-bold">Get Started with WorkFusion</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Discover the features and tools available to streamline your workflow.
      </p>
      <ul className="list-disc list-inside text-gray-600 mb-4">
        <li>Explore AI-powered tools</li>
        <li>Customize your dashboard</li>
        <li>Connect with our community</li>
      </ul>
      <Link href="/docs">
        <Button variant="default">View Documentation</Button>
      </Link>
    </Card>
  );
};

export default OnboardingTips;
