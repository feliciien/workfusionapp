"use client";

import { motion } from "framer-motion";

const stats = [
  {
    number: "99%",
    label: "Customer Satisfaction",
    description: "Our users love our AI tools",
  },
  {
    number: "24/7",
    label: "Support Available",
    description: "We're here to help anytime",
  },
  {
    number: "50+",
    label: "AI Tools",
    description: "Comprehensive suite of features",
  },
  {
    number: "10M+",
    label: "API Requests",
    description: "Processed monthly",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of companies using WorkFusion to transform their operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-lg bg-white shadow-lg"
            >
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
              <p className="text-gray-600">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20"
        >
          <p className="text-sm text-gray-500 mb-6 text-center">
            TRUSTED BY LEADING COMPANIES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-32 h-12 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
