'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export const IntegrationShowcase = () => {
  const [mounted, setMounted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageLoad = (imageName: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(imageName);
      if (newSet.size === integrations.length) {
        setImagesLoaded(true);
      }
      return newSet;
    });
  };

  const integrations = [
    {
      name: "Slack",
      icon: "/integrations/slack.svg",
      description: "Seamless communication and workflow automation",
      color: "from-[#E01E5A] to-[#ECB22E]"
    },
    {
      name: "Microsoft Teams",
      icon: "/integrations/teams.svg",
      description: "Collaborate and automate within Teams",
      color: "from-[#5059C9] to-[#7B83EB]"
    },
    {
      name: "GitHub",
      icon: "/integrations/github.svg",
      description: "Code integration and automation",
      color: "from-[#2b3137] to-[#404448]"
    },
    {
      name: "Jira",
      icon: "/integrations/jira.svg",
      description: "Project management automation",
      color: "from-[#2684FF] to-[#0052CC]"
    }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <motion.h2 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Powerful Integrations
        </motion.h2>
        <motion.p 
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Connect with your favorite tools and platforms
        </motion.p>
      </div>

      {/* Loading State */}
      {!imagesLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-800/50 rounded-xl p-8 animate-pulse"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full mb-6" />
                <div className="w-32 h-6 bg-gray-700/50 rounded mb-3" />
                <div className="w-48 h-4 bg-gray-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loaded State */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-opacity duration-500 ${
        imagesLoaded ? 'opacity-100' : 'opacity-0 hidden'
      }`}>
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            className={`bg-gradient-to-br ${integration.color} p-8 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <div className="relative w-16 h-16 mb-6 mx-auto">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-lg" />
              <Image
                src={integration.icon}
                alt={integration.name}
                fill
                className="object-contain relative z-10"
                onLoad={() => handleImageLoad(integration.name)}
                onError={() => console.error(`Failed to load image for ${integration.name}`)}
              />
            </div>
            <h3 className="text-xl font-semibold text-white text-center mb-3">
              {integration.name}
            </h3>
            <p className="text-gray-300 text-center text-sm">
              {integration.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
