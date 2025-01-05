"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out SynthAI",
    features: [
      "5 AI generations per day",
      "Basic code analysis",
      "Standard response time",
      "Community support",
      "Basic templates"
    ],
    cta: "Get Started",
    href: "/sign-up"
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    description: "Best for professionals and teams",
    features: [
      "Unlimited AI generations",
      "Priority API access",
      "Advanced code analysis",
      "Custom AI models",
      "Priority support",
      "Advanced analytics",
      "Custom templates",
      "API access",
      "Team collaboration"
    ],
    cta: "Upgrade to Pro",
    href: "/manage-subscription",
    popular: true
  }
];

export function PricingSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { data: session } = useSession();

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={cn(
                "relative bg-white rounded-2xl shadow-lg p-8",
                plan.popular && "border-2 border-purple-500"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium py-2 px-4">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <Button
                  asChild
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : ""
                  )}
                >
                  <Link href={session ? plan.href : "/sign-in"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 text-gray-600"
        >
          <p>
            All plans include 24/7 support and a 30-day money-back guarantee.
            <br />
            Need a custom plan?{" "}
            <a href="#contact" className="text-purple-600 hover:underline">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
