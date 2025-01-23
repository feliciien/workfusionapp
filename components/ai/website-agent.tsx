"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Example: Generate suggestions based on current path
    // Customize suggestions based on user's current page
    if (!path.includes('pricing')) {
      newSuggestions.push({
        id: 'pricing-1',
        type: 'feature',
        title: 'View Pricing Plans',
        description: 'Explore our pricing options and upgrade to Pro.',
        action: '/pricing',
        priority: 1,
      });
    }

    if (!path.includes('docs')) {
      newSuggestions.push({
        id: 'docs-1',
        type: 'content',
        title: 'Documentation',
        description: 'Learn how to use all our features effectively.',
        action: '/docs',
        priority: 2,
      });
    }

    if (!path.includes('affiliate')) {
      newSuggestions.push({
        id: 'affiliate-1',
        type: 'feature',
        title: 'Join Affiliate Program',
        description: 'Earn rewards by sharing WorkFusion.',
        action: '/affiliate',
        priority: 3,
      });
    }

    // Show contact page for support
    if (!path.includes('contact')) {
      newSuggestions.push({
        id: 'contact-1',
        type: 'navigation',
        title: 'Need Help?',
        description: 'Contact our support team for assistance.',
        action: '/contact',
        priority: 4,
      });
    }

    // Login suggestion for non-authenticated pages
    if (!path.includes('auth/signin')) {
      newSuggestions.push({
        id: 'auth-1',
        type: 'navigation',
        title: 'Sign In',
        description: 'Access your account to use all features.',
        action: '/auth/signin',
        priority: 5,
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
