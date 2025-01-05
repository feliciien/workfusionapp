'use client';

import { motion } from "framer-motion";

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Customer Success",
];

const positions = [
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    description:
      "Join our core engineering team to build the next generation of AI-powered automation solutions.",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    description:
      "Lead product strategy and roadmap for our enterprise automation platform.",
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    description:
      "Create beautiful and intuitive user experiences for our enterprise customers.",
  },
  {
    title: "Enterprise Account Executive",
    department: "Sales",
    location: "London, UK",
    type: "Full-time",
    description:
      "Drive business growth by building relationships with enterprise customers.",
  },
  {
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Create compelling content that showcases our technology and customer success stories.",
  },
  {
    title: "Technical Solutions Engineer",
    department: "Customer Success",
    location: "Singapore",
    type: "Full-time",
    description:
      "Help our enterprise customers succeed with WorkFusion's automation platform.",
  },
];

const benefits = [
  {
    title: "Health & Wellness",
    description: "Comprehensive medical, dental, and vision coverage for you and your family",
    icon: "🏥",
  },
  {
    title: "Flexible Work",
    description: "Remote-first culture with flexible hours and work-life balance",
    icon: "🏠",
  },
  {
    title: "Learning & Development",
    description: "Annual learning stipend and professional development opportunities",
    icon: "📚",
  },
  {
    title: "Equity",
    description: "Competitive equity package to share in company success",
    icon: "📈",
  },
  {
    title: "Time Off",
    description: "Unlimited PTO policy and paid parental leave",
    icon: "⛱️",
  },
  {
    title: "Team Events",
    description: "Regular team offsites and social events",
    icon: "🎉",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Mission
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Help us transform enterprise operations through intelligent automation.
            We're looking for passionate individuals to join our team.
          </p>
        </motion.div>

        {/* Department Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {departments.map((dept, index) => (
            <motion.button
              key={dept}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300"
            >
              {dept}
            </motion.button>
          ))}
        </div>

        {/* Open Positions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {positions.map((position, index) => (
            <motion.div
              key={position.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {position.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-purple-400 text-sm">
                      {position.department}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">
                      {position.location}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{position.type}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Apply Now
                </motion.button>
              </div>
              <p className="text-gray-400">{position.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-12">
            Why Work at WorkFusion?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-500/20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Don't see the right role?
          </h2>
          <p className="text-gray-400 mb-6">
            Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Submit Resume
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
