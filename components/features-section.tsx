import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const features = [
  {
    title: "AI-Powered Automation",
    description: "Automate complex business processes with advanced AI and machine learning capabilities.",
    icon: "🤖",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Smart Document Processing",
    description: "Extract and process information from documents with high accuracy using AI.",
    icon: "📄",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Advanced Analytics",
    description: "Gain insights from your data with powerful analytics and visualization tools.",
    icon: "📊",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with encryption, compliance, and access controls.",
    icon: "🔒",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Seamless Integration",
    description: "Connect with your existing tools and workflows effortlessly.",
    icon: "🔄",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "24/7 Support",
    description: "Get expert help whenever you need it with our dedicated support team.",
    icon: "💬",
    color: "from-pink-500 to-rose-500",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-black/50 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Powerful Features for Modern Businesses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-xl text-gray-400"
          >
            Everything you need to transform your business with AI
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
