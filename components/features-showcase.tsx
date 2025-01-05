"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Code2, 
  ImageIcon, 
  MessageSquare, 
  Music, 
  VideoIcon,
  BookOpen,
  LineChart,
  Network
} from "lucide-react";

const features = [
  {
    icon: <Code2 className="w-10 h-10 text-purple-600" />,
    title: "Code Generation",
    description: "Generate high-quality code in multiple programming languages.",
  },
  {
    icon: <ImageIcon className="w-10 h-10 text-blue-600" />,
    title: "Image Creation",
    description: "Create stunning images from text descriptions.",
  },
  {
    icon: <MessageSquare className="w-10 h-10 text-green-600" />,
    title: "Chat Assistant",
    description: "Get instant answers and assistance for any task.",
  },
  {
    icon: <Music className="w-10 h-10 text-red-600" />,
    title: "Music Generation",
    description: "Create original music and melodies with AI.",
  },
  {
    icon: <VideoIcon className="w-10 h-10 text-yellow-600" />,
    title: "Video Creation",
    description: "Generate and edit videos with AI assistance.",
  },
  {
    icon: <BookOpen className="w-10 h-10 text-indigo-600" />,
    title: "Learning Tools",
    description: "AI-powered education and training assistance.",
  },
  {
    icon: <LineChart className="w-10 h-10 text-pink-600" />,
    title: "Business Analytics",
    description: "Generate insights from your business data.",
  },
  {
    icon: <Network className="w-10 h-10 text-orange-600" />,
    title: "Network Analysis",
    description: "Analyze and optimize your network infrastructure.",
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful AI Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your workflow with our comprehensive suite of AI-powered tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
