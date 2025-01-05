'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { integrationClient } from "@/lib/integrations/client";
import { JiraIntegration } from "@/lib/integrations/types";

const features = [
  {
    title: "Issue Tracking",
    description: "Automatically sync and track issues between WorkFusion and Jira",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: "Project Management",
    description: "Manage projects and track progress across both platforms",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Automated Workflows",
    description: "Create custom workflows between WorkFusion and Jira",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Custom Fields",
    description: "Map and sync custom fields between both platforms",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
];

export default function JiraIntegrationPage() {
  const [integration, setIntegration] = useState<JiraIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Redirect to Jira OAuth flow
      const scopes = ['read:jira-work', 'write:jira-work', 'manage:jira-webhook'].join(' ');
      window.location.href = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${
        process.env.NEXT_PUBLIC_JIRA_CLIENT_ID
      }&scope=${scopes}&redirect_uri=${
        encodeURIComponent(`${window.location.origin}/api/integrations/jira`)
      }&response_type=code&prompt=consent`;
    } catch (error) {
      console.error('Failed to connect to Jira:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateIssue = async (projectKey: string, summary: string, description: string, issueType: string) => {
    try {
      await integrationClient.jiraAction('createIssue', {
        projectKey,
        summary,
        description,
        issueType,
      });
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const handleListProjects = async () => {
    try {
      const { projects } = await integrationClient.jiraAction('listProjects', {});
      // Update UI with projects
      return projects;
    } catch (error) {
      console.error('Failed to list projects:', error);
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
                src="/logos/jira.svg"
                alt="Jira"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Jira Integration
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto"
          >
            Seamlessly integrate WorkFusion with Jira to enhance project management
            and streamline issue tracking across your organization.
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
                    Install the App
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Install the WorkFusion app from the Atlassian Marketplace.
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
                    Configure Project Settings
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Set up project mappings and customize field synchronization.
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
                    Create Workflows
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Define automated workflows between WorkFusion and Jira.
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
            {isConnecting ? 'Connecting...' : 'Connect with Jira'}
          </motion.button>
          <p className="mt-4 text-gray-400">
            Need help? Check out our{" "}
            <a href="/docs/integrations/jira" className="text-purple-400 hover:text-purple-300">
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
