'use client';

import { Analytics } from '@vercel/analytics/react';
import { TrustedCompanies } from "@/components/trusted-companies";
import { ValueProposition } from "@/components/value-proposition";
import { IntegrationsSection } from "@/components/integrations-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from 'next/link';

const features = [
  {
    title: "AI-Powered Automation",
    description: "Automate complex business processes with advanced AI and machine learning capabilities.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Smart Document Processing",
    description: "Extract and process information from documents with high accuracy using AI.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Advanced Analytics",
    description: "Gain insights from your data with powerful analytics and visualization tools.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with encryption, compliance, and access controls.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing tools and workflows.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "Get help anytime with our dedicated support team and resources.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10 animate-gradient-x"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>
        
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your Business with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-gradient-text">
                  AI-Powered Automation
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Streamline operations, reduce costs, and accelerate growth with our enterprise-grade AI solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="/get-started"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Get Started Free
                </motion.a>
                <motion.a
                  href="/schedule-demo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                >
                  Schedule Demo
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/50 via-purple-800/50 to-indigo-900/50 group hover:scale-[1.02] transition-transform duration-500">
                {/* Main Dashboard Image */}
                <div className="relative h-full w-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                  {/* Window Header */}
                  <div className="h-8 bg-gray-800/80 backdrop-blur-sm flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6 animate-fade-in-up space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors duration-300"
                      >
                        <div className="text-sm text-gray-400 mb-1">Total Projects</div>
                        <div className="text-2xl font-semibold text-white">128</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors duration-300"
                      >
                        <div className="text-sm text-gray-400 mb-1">Active Tasks</div>
                        <div className="text-2xl font-semibold text-white">34</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors duration-300"
                      >
                        <div className="text-sm text-gray-400 mb-1">Efficiency</div>
                        <div className="text-2xl font-semibold text-white">92%</div>
                      </motion.div>
                    </div>
                    
                    {/* Chart Section */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors duration-300"
                    >
                      <div className="text-sm text-gray-400 mb-4">Performance Analytics</div>
                      <div className="h-40 flex items-end justify-between gap-2">
                        {[65, 45, 75, 55, 85, 35, 95, 65, 75, 45, 65, 55].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-full bg-gradient-to-t from-purple-500/30 to-purple-500/50 rounded-t group-hover:from-purple-500/40 group-hover:to-purple-500/60 transition-colors duration-300"
                          />
                        ))}
                      </div>
                    </motion.div>
                    
                    {/* Recent Activity */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-colors duration-300"
                    >
                      <div className="text-sm text-gray-400 mb-4">Recent Activity</div>
                      <div className="space-y-3">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="text-sm text-gray-300">New project created</div>
                        </motion.div>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="text-sm text-gray-300">Task completed</div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-12 -right-6 w-24 h-24 bg-purple-500/30 rounded-full blur-xl animate-float"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl animate-float-delayed"></div>
                
                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent backdrop-blur-[2px]"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <ValueProposition />

      {/* Trusted Companies */}
      <TrustedCompanies />

      {/* Integrations */}
      <section className="w-full py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-purple-500/5 to-gray-900/0"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Powerful
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {" "}Integrations
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect with your favorite tools and platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 mb-4">
                  <Image
                    src="/logos/slack.svg"
                    alt="Slack"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Slack</h3>
                <p className="text-gray-400">
                  Real-time notifications and workflow automation
                </p>
                <motion.a
                  href="/integrations/slack"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 mb-4">
                  <Image
                    src="/logos/github.svg"
                    alt="GitHub"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">GitHub</h3>
                <p className="text-gray-400">
                  Code repository integration and CI/CD automation
                </p>
                <motion.a
                  href="/integrations/github"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 mb-4">
                  <Image
                    src="/logos/jira.svg"
                    alt="Jira"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Jira</h3>
                <p className="text-gray-400">
                  Project management and issue tracking
                </p>
                <motion.a
                  href="/integrations/jira"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative">
                <div className="w-12 h-12 mb-4">
                  <Image
                    src="/logos/notion.svg"
                    alt="Notion"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Notion</h3>
                <p className="text-gray-400">
                  Knowledge base and documentation
                </p>
                <motion.a
                  href="/integrations/notion"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/integrations"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all integrations
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Features Section */}
      <section className="w-full py-20 bg-gray-900">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Enterprise Success
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to automate and optimize your operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      <Analytics />
    </main>
  );
}
