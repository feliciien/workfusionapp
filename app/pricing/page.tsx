'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PRICING, PRO_FEATURES, FREE_LIMITS } from '@/constants';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: session } = useSession();
  const plan = isYearly ? PRICING.YEARLY : PRICING.MONTHLY;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Upgrade to Pro</h1>
          <p className="text-xl text-gray-400">Choose the perfect plan for your needs</p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center items-center gap-4">
          <span className={!isYearly ? 'text-white' : 'text-gray-400'}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 bg-gray-700 rounded-full p-1 transition-colors duration-300"
          >
            <div
              className={`absolute w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                isYearly ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={isYearly ? 'text-white' : 'text-gray-400'}>Yearly</span>
            <Badge variant="secondary" className="bg-pink-500/10 text-pink-500 border-pink-500/20">
              Save 17%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Free Plan */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Free Plan</h3>
                <p className="text-gray-400 mt-2">Perfect for getting started</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>
              <Button className="w-full" variant="secondary">
                Current Plan
              </Button>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Includes:</p>
                <ul className="space-y-3">
                  {Object.entries(FREE_LIMITS).map(([feature, limit]) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{limit} {feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 bg-pink-500/10 border-pink-500/20 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge variant="secondary" className="bg-pink-500 text-white">
                MOST POPULAR
              </Badge>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-gray-400 mt-2">For power users and teams</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400 ml-2">/{plan.period}</span>
              </div>
              <Button className="w-full bg-pink-500 hover:bg-pink-600">
                Try Pro Free for 14 Days
              </Button>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
