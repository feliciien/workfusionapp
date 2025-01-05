'use client';

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export const ValueProposition = () => {
  const benefits = [
    {
      title: "Enterprise-Grade AI",
      description: "Powerful AI capabilities designed for business-critical operations",
      icon: CheckCircle
    },
    {
      title: "Seamless Integration",
      description: "Easily integrate with your existing tools and workflows",
      icon: CheckCircle
    },
    {
      title: "Data Security",
      description: "Enterprise-level security with data encryption and compliance",
      icon: CheckCircle
    }
  ];

  return (
    <section className="relative py-20 bg-[#111827]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose WorkFusion
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform your business with our enterprise AI platform
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <benefit.icon className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
