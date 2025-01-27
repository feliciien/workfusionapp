"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { useAgent } from './agent-provider';

interface Suggestion {
  id: string;
  type: 'navigation' | 'feature' | 'content';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

interface UserContext {
  currentPath: string;
  lastVisited: string[];
  interactions: string[];
}

export const WebsiteAgent = () => {
  const pathname = usePathname();
  const { isEnabled, preferences } = useAgent();
  const [isVisible, setIsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userContext, setUserContext] = useState<UserContext>({
    currentPath: '',
    lastVisited: [],
    interactions: [],
  });

  // Update context when path changes
  useEffect(() => {
    if (pathname) {
      setUserContext(prev => ({
        ...prev,
        currentPath: pathname,
        lastVisited: [pathname, ...prev.lastVisited].slice(0, 5),
      }));
      generateContextualSuggestions(pathname);
    }
  }, [pathname]);

  // Generate suggestions based on current context
  const generateContextualSuggestions = (path: string) => {
    const newSuggestions: Suggestion[] = [];

    // Analytics-based recommendations
    if (!path.includes("analytics")) {
      newSuggestions.push({
        id: "analytics-1",
        type: "feature",
        title: "Website Analytics Dashboard",
        description:
          "Get detailed insights into your website performance, user behavior patterns, and conversion metrics.",
        action: "/analytics",
        priority: 1
      });
    }

    // Advanced pricing recommendations
    if (!path.includes("pricing")) {
      newSuggestions.push({
        id: "pricing-1",
        type: "feature",
        title: "Custom Pricing Solutions",
        description:
          "Explore our flexible pricing plans with enterprise options, annual discounts, and team collaboration features.",
        action: "/pricing",
        priority: 2
      });
    }

    // Enhanced documentation suggestions
    if (!path.includes("docs")) {
      newSuggestions.push({
        id: "docs-1",
        type: "content",
        title: "Interactive Documentation",
        description:
          "Access comprehensive guides, API references, code examples, and video tutorials for maximum productivity.",
        action: "/docs",
        priority: 3
      });
    }

    // Personalized affiliate program
    if (!path.includes("affiliate")) {
      newSuggestions.push({
        id: "affiliate-1",
        type: "feature",
        title: "Premium Affiliate Program",
        description:
          "Join our tiered affiliate program with increased commissions, exclusive promotional materials, and dedicated support.",
        action: "/affiliate",
        priority: 4
      });
    }

    // Enhanced support options
    if (!path.includes("contact")) {
      newSuggestions.push({
        id: "contact-1",
        type: "navigation",
        title: "Premium Support Access",
        description:
          "Get priority support with 24/7 live chat, dedicated account manager, and technical consultation services.",
        action: "/contact",
        priority: 5
      });
    }

    // Advanced authentication features
    if (!path.includes("auth/signin")) {
      newSuggestions.push({
        id: "auth-1",
        type: "navigation",
        title: "Secure Account Access",
        description:
          "Sign in to access premium features, team collaboration tools, and personalized workspace settings.",
        action: "/auth/signin",
        priority: 6
      });
    }

    // Performance optimization suggestions
    if (!path.includes("website-performance")) {
      newSuggestions.push({
        id: "performance-1",
        type: "feature",
        title: "Performance Optimization",
        description:
          "Analyze and optimize your website performance with AI-powered recommendations and real-time monitoring.",
        action: "/website-performance",
        priority: 7
      });
    }

    // Network monitoring features
    if (!path.includes("network")) {
      newSuggestions.push({
        id: "network-1",
        type: "feature",
        title: "Network Health Monitor",
        description:
          "Monitor your network performance, detect issues early, and receive automated optimization suggestions.",
        action: "/network",
        priority: 8
      });
    }

    setSuggestions(newSuggestions);
  };

  // Track user interactions
  const trackInteraction = (type: string) => {
    setUserContext(prev => ({
      ...prev,
      interactions: [...prev.interactions, type],
    }));
  };

  if (!isEnabled || !preferences.showSuggestions) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        {/* Agent Toggle Button */}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 transition"
          aria-label="Toggle AI Assistant"
          title="AI Website Assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </button>

        {/* Suggestions Panel */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-3">Smart Suggestions</h3>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    trackInteraction(suggestion.type);
                    if (suggestion.action) {
                      window.location.href = suggestion.action;
                    }
                  }}
                >
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WebsiteAgent;
