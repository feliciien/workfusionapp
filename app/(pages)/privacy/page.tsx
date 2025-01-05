'use client';

import { motion } from "framer-motion";

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information that you provide directly to us, information we obtain automatically when you use our services, and information from third-party sources. This includes:

• Personal Information: Name, email address, and contact details
• Usage Data: How you interact with our services
• Device Information: IP address, browser type, and operating system
• Cookie Data: Information stored through cookies and similar technologies`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect for various purposes, including:

• Providing and maintaining our services
• Improving and personalizing your experience
• Communicating with you about updates and changes
• Analyzing usage patterns and trends
• Ensuring security and preventing fraud`,
  },
  {
    title: "Data Sharing and Disclosure",
    content: `We may share your information with:

• Service providers and business partners
• Legal authorities when required by law
• Other parties with your consent
• Affiliated companies within our corporate group

We implement appropriate security measures to protect your data.`,
  },
  {
    title: "Your Rights and Choices",
    content: `You have certain rights regarding your personal information:

• Access and update your information
• Request deletion of your data
• Opt-out of marketing communications
• Control cookie preferences
• Export your data

Contact our privacy team to exercise these rights.`,
  },
  {
    title: "Data Retention",
    content: `We retain your information for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

We implement data retention policies and regularly review stored data.`,
  },
  {
    title: "International Data Transfers",
    content: `We may transfer your data internationally. We ensure appropriate safeguards are in place, including:

• Standard contractual clauses
• Privacy Shield certification
• Adequate data protection measures

We comply with applicable data transfer regulations.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Policy
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: January 5, 2025
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-invert max-w-none"
        >
          <div className="text-gray-400 mb-12">
            This Privacy Policy describes how WorkFusion ("we," "us," or "our")
            collects, uses, and shares your personal information when you use our
            services. By using WorkFusion, you agree to the collection and use of
            information in accordance with this policy.
          </div>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-gray-400 whitespace-pre-line">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-400 mb-6">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="text-gray-400 space-y-2">
              <li>Email: privacy@workfusion.com</li>
              <li>Address: 123 Innovation Drive, San Francisco, CA 94105</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
