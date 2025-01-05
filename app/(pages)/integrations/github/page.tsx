'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { integrationClient } from "@/lib/integrations/client";
import { GitHubIntegration } from "@/lib/integrations/types";

const features = [
  {
    title: "Repository Integration",
    description: "Connect and manage your GitHub repositories directly from WorkFusion",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    title: "CI/CD Pipeline",
    description: "Automate your development workflow with integrated CI/CD pipelines",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Pull Request Automation",
    description: "Automatically create and manage pull requests based on your workflow",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Code Review",
    description: "Streamline code reviews with automated checks and insights",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function GitHubIntegrationPage() {
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Redirect to GitHub OAuth flow
      const scopes = ['repo', 'workflow', 'admin:repo_hook'].join(' ');
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${
        process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      }&scope=${scopes}&redirect_uri=${
        encodeURIComponent(`${window.location.origin}/api/integrations/github`)
      }`;
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreatePR = async (owner: string, repo: string, title: string, body: string, branch: string) => {
    try {
      await integrationClient.githubAction('createPR', { owner, repo, title, body, branch });
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to create PR:', error);
    }
  };

  const handleListRepos = async () => {
    try {
      const { repositories } = await integrationClient.githubAction('listRepos', {});
      // Update UI with repositories
      return repositories;
    } catch (error) {
      console.error('Failed to list repositories:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="relative w-16 h-16 mr-4">
              <Image
                src="/logos/github.svg"
                alt="GitHub"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">
              GitHub Integration
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto"
          >
            Streamline your development workflow by integrating WorkFusion with GitHub.
            Automate code reviews, manage repositories, and enhance collaboration.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
                className="relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <div>
                  <div className="absolute h-12 w-12 text-white rounded-md">
                    {feature.icon}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg font-medium text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">
              Getting Started
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500/20 text-purple-400">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Install the GitHub App
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Install the WorkFusion GitHub App from the GitHub Marketplace.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500/20 text-purple-400">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Configure Repository Access
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Select which repositories WorkFusion should have access to.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500/20 text-purple-400">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Set Up Workflows
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Configure automated workflows for your repositories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect with GitHub'}
          </motion.button>
          <p className="mt-4 text-gray-400">
            Need help? Check out our{" "}
            <a href="/docs/integrations/github" className="text-purple-400 hover:text-purple-300">
              documentation
            </a>{" "}
            or{" "}
            <a href="/contact" className="text-purple-400 hover:text-purple-300">
              contact support
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
