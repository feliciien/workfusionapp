'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    title: "AI-Powered Automation",
    description: "Automate complex business processes with advanced AI and machine learning capabilities.",
    icon: "🤖",
    color: "from-purple-500 to-pink-500",
    delay: 0,
  },
  {
    title: "Smart Document Processing",
    description: "Extract and process information from documents with high accuracy using AI.",
    icon: "📄",
    color: "from-blue-500 to-cyan-500",
    delay: 0.1,
  },
  {
    title: "Advanced Analytics",
    description: "Gain insights from your data with powerful analytics and visualization tools.",
    icon: "📊",
    color: "from-green-500 to-emerald-500",
    delay: 0.2,
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with encryption, compliance, and access controls.",
    icon: "🔒",
    color: "from-orange-500 to-red-500",
    delay: 0.3,
  },
  {
    title: "Seamless Integration",
    description: "Connect with your existing tools and workflows effortlessly.",
    icon: "🔄",
    color: "from-indigo-500 to-purple-500",
    delay: 0.4,
  },
  {
    title: "24/7 Support",
    description: "Get expert help whenever you need it with our dedicated support team.",
    icon: "💬",
    color: "from-pink-500 to-rose-500",
    delay: 0.5,
  },
];

export const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <section ref={containerRef} className="py-24 bg-black/50 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      
      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div ref={titleRef} className="text-center mb-16 sm:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            Powerful Features for Modern Businesses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Everything you need to transform your business with AI
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const { ref, inView } = useInView({
              threshold: 0.2,
              triggerOnce: true,
            });

            return (
              <motion.div
                key={feature.title}
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full p-6 sm:p-8 bg-black/40 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all duration-300">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 transform transition-transform group-hover:scale-110 duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
