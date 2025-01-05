'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const integrations = [
  {
    name: "Salesforce",
    description: "Automate your CRM workflows and customer data management",
    icon: "/logos/salesforce.svg",
    category: "CRM",
  },
  {
    name: "SAP",
    description: "Streamline your ERP processes and business operations",
    icon: "/logos/sap.svg",
    category: "ERP",
  },
  {
    name: "ServiceNow",
    description: "Enhance IT service management and workflow automation",
    icon: "/logos/servicenow.svg",
    category: "ITSM",
  },
  {
    name: "Microsoft 365",
    description: "Integrate with Office apps and Microsoft cloud services",
    icon: "/logos/microsoft.svg",
    category: "Productivity",
  },
  {
    name: "Oracle",
    description: "Connect with Oracle databases and business applications",
    icon: "/logos/oracle.svg",
    category: "Database",
  },
  {
    name: "Workday",
    description: "Automate HR processes and employee management",
    icon: "/logos/workday.svg",
    category: "HR",
  },
];

const categories = [
  "All",
  "CRM",
  "ERP",
  "ITSM",
  "Productivity",
  "Database",
  "HR",
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Connect with Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Favorite Tools
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            WorkFusion seamlessly integrates with your existing tech stack to
            provide end-to-end automation solutions.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300"
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={integration.icon}
                    alt={integration.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {integration.name}
                  </h3>
                  <span className="text-sm text-purple-400">
                    {integration.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-400">{integration.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 w-full py-2 rounded-lg bg-gray-700/50 text-white hover:bg-purple-500/20 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-500/20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Don't see your integration?
          </h2>
          <p className="text-gray-400 mb-6">
            Our team can help you build custom integrations for your specific needs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Contact Our Team
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
