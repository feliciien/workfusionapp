'use client';

import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Powered Automation",
    description: "Leverage advanced machine learning algorithms to automate complex business processes with unprecedented accuracy.",
    icon: "🤖",
  },
  {
    title: "Smart Document Processing",
    description: "Extract and process information from any document type with our intelligent OCR and NLP technology.",
    icon: "📄",
  },
  {
    title: "Workflow Optimization",
    description: "Streamline your operations with intelligent workflow routing and automated decision-making.",
    icon: "⚡",
  },
  {
    title: "Real-time Analytics",
    description: "Get instant insights into your processes with comprehensive analytics and monitoring.",
    icon: "📊",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with encryption, compliance controls, and detailed audit logs.",
    icon: "🔒",
  },
  {
    title: "Seamless Integration",
    description: "Connect with your existing tools through our extensive API and pre-built integrations.",
    icon: "🔄",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Enterprise Success
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover how our AI-powered features can transform your business operations
            and drive unprecedented growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
