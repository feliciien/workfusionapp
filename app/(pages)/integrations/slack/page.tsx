'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { integrationClient } from "@/lib/integrations/client";
import { SlackIntegration } from "@/lib/integrations/types";

const features = [
  {
    title: "Real-time Notifications",
    description: "Get instant alerts about workflow status, approvals, and system events",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    title: "Custom Workflows",
    description: "Create automated workflows triggered by Slack commands and events",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: "Interactive Messages",
    description: "Send rich, interactive messages with buttons and forms",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    title: "Channel Management",
    description: "Automatically create and manage Slack channels for projects",
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function SlackIntegrationPage() {
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Redirect to Slack OAuth flow
      window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
      }&scope=channels:manage,chat:write,incoming-webhook&redirect_uri=${
        encodeURIComponent(`${window.location.origin}/api/integrations/slack`)
      }`;
    } catch (error) {
      console.error('Failed to connect to Slack:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateChannel = async (channelName: string) => {
    try {
      await integrationClient.slackAction('createChannel', { channelName });
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const handleSendMessage = async (channelName: string, message: string) => {
    try {
      await integrationClient.slackAction('sendMessage', { channelName, message });
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to send message:', error);
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
                src="/logos/slack.svg"
                alt="Slack"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Slack Integration
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto"
          >
            Connect WorkFusion with Slack to streamline communication and automate
            workflows across your organization.
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
                    Install the WorkFusion App
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Add the WorkFusion app to your Slack workspace from the Slack App Directory.
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
                    Configure Permissions
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Grant necessary permissions for WorkFusion to access your Slack workspace.
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
                    Set Up Notifications
                  </h3>
                  <p className="mt-1 text-gray-400">
                    Choose which channels should receive notifications and configure alert preferences.
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
            {isConnecting ? 'Connecting...' : 'Connect with Slack'}
          </motion.button>
          <p className="mt-4 text-gray-400">
            Need help? Check out our{" "}
            <a href="/docs/integrations/slack" className="text-purple-400 hover:text-purple-300">
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
