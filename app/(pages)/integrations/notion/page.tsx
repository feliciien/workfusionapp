'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { integrationClient } from "@/lib/integrations/client";
import { NotionIntegration } from "@/lib/integrations/types";

const features = [
  {
    title: "Document Sync",
    description: "Keep your documentation in sync between WorkFusion and Notion",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Knowledge Base",
    description: "Create and maintain a centralized knowledge base across platforms",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Template Library",
    description: "Access and use pre-built templates for common workflows",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: "Real-time Collaboration",
    description: "Enable seamless collaboration between team members",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function NotionIntegrationPage() {
  const [integration, setIntegration] = useState<NotionIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Redirect to Notion OAuth flow
      window.location.href = `https://api.notion.com/v1/oauth/authorize?client_id=${
        process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
      }&response_type=code&owner=user&redirect_uri=${
        encodeURIComponent(`${window.location.origin}/api/integrations/notion`)
      }`;
    } catch (error) {
      console.error('Failed to connect to Notion:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreatePage = async (databaseId: string, title: string, properties: any) => {
    try {
      await integrationClient.notionAction('createPage', {
        databaseId,
        title,
        properties,
      });
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const handleSearchDatabase = async (databaseId: string, filter?: any, sorts?: any) => {
    try {
      const { results } = await integrationClient.notionAction('searchDatabase', {
        databaseId,
        filter,
        sorts,
      });
      // Update UI with search results
      return results;
    } catch (error) {
      console.error('Failed to search database:', error);
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
                src="/logos/notion.svg"
                alt="Notion"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Notion Integration
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto"
          >
            Connect WorkFusion with Notion to create a seamless knowledge management
            system and enhance team collaboration.
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
                    Connect Your Workspace
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Link your Notion workspace with WorkFusion.
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
                    Set Up Permissions
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Configure access permissions and sharing settings.
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
                    Import Templates
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Choose from our library of pre-built templates to get started.
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
            {isConnecting ? 'Connecting...' : 'Connect with Notion'}
          </motion.button>
          <p className="mt-4 text-gray-400">
            Need help? Check out our{" "}
            <a href="/docs/integrations/notion" className="text-purple-400 hover:text-purple-300">
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
