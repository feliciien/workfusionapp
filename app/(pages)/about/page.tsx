'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-founder",
    image: "/team/sarah.jpg",
    bio: "Former ML researcher at Stanford, 15+ years in AI and automation.",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "/team/michael.jpg",
    bio: "Previously led engineering at Google Cloud AI, passionate about enterprise automation.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Product",
    image: "/team/emily.jpg",
    bio: "Product veteran from Microsoft, focused on user-centric AI solutions.",
  },
];

const stats = [
  { label: "Founded", value: "2020" },
  { label: "Employees", value: "150+" },
  { label: "Countries", value: "30+" },
  { label: "Enterprises Served", value: "500+" },
];

export default function AboutPage() {
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
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              WorkFusion
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're on a mission to transform enterprise operations through
            intelligent automation and AI-powered solutions.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-8 mb-20 border border-gray-700/50"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-400 text-lg">
            WorkFusion is dedicated to empowering enterprises with cutting-edge AI
            automation solutions that drive efficiency, reduce costs, and enable
            innovation. We believe in creating technology that not only solves
            today's challenges but anticipates tomorrow's needs.
          </p>
        </motion.div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {member.name}
                  </h3>
                  <div className="text-purple-400 mb-3">{member.role}</div>
                  <p className="text-gray-400">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Innovation First
              </h3>
              <p className="text-gray-400">
                We constantly push boundaries to create cutting-edge solutions.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Customer Success
              </h3>
              <p className="text-gray-400">
                Your success is our success. We're committed to your growth.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Continuous Improvement
              </h3>
              <p className="text-gray-400">
                We're always learning and evolving to serve you better.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
