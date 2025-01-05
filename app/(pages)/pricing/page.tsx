'use client';

import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: "Starter",
    price: "49",
    description: "Perfect for small teams getting started with automation",
    features: [
      "Up to 5 team members",
      "10 automated workflows",
      "Basic analytics",
      "Email support",
      "API access",
      "Community access",
    ],
  },
  {
    name: "Professional",
    price: "99",
    description: "Ideal for growing businesses with advanced needs",
    features: [
      "Up to 20 team members",
      "Unlimited workflows",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom integrations",
      "Audit logs",
      "SSO authentication",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations requiring maximum control",
    features: [
      "Unlimited team members",
      "Unlimited workflows",
      "Custom analytics",
      "24/7 dedicated support",
      "Advanced API access",
      "Custom development",
      "Advanced security",
      "Compliance controls",
      "SLA guarantee",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Transparent
            </span>{" "}
            Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day
            free trial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gray-800/50 rounded-xl border ${
                tier.popular
                  ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                  : "border-gray-700/50"
              } p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-5xl font-extrabold text-white">
                    ${tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="ml-1 text-2xl text-gray-400">/month</span>
                  )}
                </div>
                <p className="mt-4 text-gray-400">{tier.description}</p>
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  {tier.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
