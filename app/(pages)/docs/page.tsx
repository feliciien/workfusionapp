'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const sidebar = [
  {
    title: "Getting Started",
    items: [
      { name: "Introduction", href: "#introduction" },
      { name: "Quick Start", href: "#quick-start" },
      { name: "Installation", href: "#installation" },
      { name: "Configuration", href: "#configuration" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { name: "Automation Flows", href: "#flows" },
      { name: "Document Processing", href: "#documents" },
      { name: "Machine Learning", href: "#ml" },
      { name: "Business Rules", href: "#rules" },
    ],
  },
  {
    title: "Guides",
    items: [
      { name: "Creating Workflows", href: "#workflows" },
      { name: "Data Integration", href: "#integration" },
      { name: "Custom Models", href: "#models" },
      { name: "Best Practices", href: "#practices" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { name: "REST API", href: "/api" },
      { name: "SDK Documentation", href: "#sdk" },
      { name: "Webhooks", href: "#webhooks" },
      { name: "Authentication", href: "#auth" },
    ],
  },
];

const searchResults = [
  {
    title: "Getting Started with WorkFusion",
    path: "Getting Started > Introduction",
    preview: "Learn the basics of WorkFusion's automation platform...",
  },
  {
    title: "Creating Your First Workflow",
    path: "Guides > Creating Workflows",
    preview: "Step-by-step guide to creating automation workflows...",
  },
  {
    title: "API Authentication",
    path: "API Reference > Authentication",
    preview: "Learn how to authenticate your API requests...",
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-64 fixed h-screen overflow-y-auto bg-gray-900 border-r border-gray-800 pt-20"
        >
          <nav className="px-4 py-8">
            {sidebar.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-gray-400 hover:text-purple-400 transition-colors block py-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(e.target.value.length > 0);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                />
                {showSearch && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                    {searchResults.map((result) => (
                      <div
                        key={result.title}
                        className="p-4 border-b border-gray-700 last:border-0 hover:bg-gray-700/50 cursor-pointer"
                      >
                        <h4 className="text-white font-medium mb-1">
                          {result.title}
                        </h4>
                        <p className="text-sm text-gray-400 mb-1">
                          {result.path}
                        </p>
                        <p className="text-sm text-gray-500">{result.preview}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert max-w-none"
            >
              <h1 className="text-4xl font-bold text-white mb-6">
                WorkFusion Documentation
              </h1>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Getting Started
                </h2>
                <p className="text-gray-400 mb-4">
                  Welcome to WorkFusion's documentation! Here you'll find everything
                  you need to know about using our AI-powered automation platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="#quick-start"
                    className="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Quick Start Guide
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Get up and running with WorkFusion in minutes
                    </p>
                  </Link>
                  <Link
                    href="#tutorials"
                    className="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Tutorials
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Step-by-step guides for common use cases
                    </p>
                  </Link>
                </div>
              </div>

              <div className="space-y-8">
                <section id="introduction">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Introduction
                  </h2>
                  <p className="text-gray-400 mb-4">
                    WorkFusion is an enterprise-grade automation platform that
                    combines AI, machine learning, and RPA to help organizations
                    automate complex business processes.
                  </p>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2">
                      Key Features:
                    </h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-2">
                      <li>Intelligent Document Processing</li>
                      <li>AI-powered Decision Making</li>
                      <li>End-to-end Process Automation</li>
                      <li>Advanced Analytics and Reporting</li>
                    </ul>
                  </div>
                </section>

                <section id="quick-start">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Quick Start
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">
                        1. Installation
                      </h3>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <code className="text-purple-400">
                          npm install @workfusion/sdk
                        </code>
                      </pre>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">
                        2. Configuration
                      </h3>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <code className="text-purple-400">
                          {`import { WorkFusion } from '@workfusion/sdk';

const wf = new WorkFusion({
  apiKey: 'your-api-key',
  environment: 'production'
});`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
