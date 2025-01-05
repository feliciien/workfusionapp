'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const blogPosts = [
  {
    title: "The Future of Enterprise Automation",
    excerpt: "Discover how AI is transforming business processes and what it means for your organization.",
    author: "Sarah Johnson",
    date: "January 5, 2025",
    category: "Industry Insights",
    readTime: "5 min read",
    image: "/blog/automation-future.jpg",
  },
  {
    title: "Implementing Intelligent Document Processing",
    excerpt: "A step-by-step guide to modernizing your document workflow with AI.",
    author: "Michael Chen",
    date: "January 3, 2025",
    category: "Technical",
    readTime: "8 min read",
    image: "/blog/document-processing.jpg",
  },
  {
    title: "ROI of Automation: Customer Success Stories",
    excerpt: "Real-world examples of how companies achieved 10x ROI with WorkFusion.",
    author: "Emily Rodriguez",
    date: "December 30, 2024",
    category: "Case Studies",
    readTime: "6 min read",
    image: "/blog/roi-success.jpg",
  },
];

const categories = [
  "All",
  "Industry Insights",
  "Technical",
  "Case Studies",
  "Product Updates",
  "Company News",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Insights &
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Resources
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest trends in automation, industry insights,
            and WorkFusion product updates.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300"
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-64 md:h-full">
              <Image
                src="/blog/featured-post.jpg"
                alt="Featured Post"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <span className="text-purple-400 text-sm font-medium">
                Featured Post
              </span>
              <h2 className="text-2xl font-bold text-white mt-2 mb-4">
                The State of Enterprise Automation in 2025
              </h2>
              <p className="text-gray-400 mb-4">
                An in-depth analysis of how enterprises are leveraging AI and
                automation to transform their operations, featuring insights from
                industry leaders and real-world case studies.
              </p>
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>By WorkFusion Team</span>
                <span className="mx-2">•</span>
                <span>January 1, 2025</span>
                <span className="mx-2">•</span>
                <span>12 min read</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Read More
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-purple-400 mb-2">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-500/20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-400 mb-6">
            Subscribe to our newsletter for the latest insights and updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Subscribe
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
