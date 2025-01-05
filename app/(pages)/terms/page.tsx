'use client';

import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Terms of Use",
    content: `By accessing and using WorkFusion's services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.

Our services are available only to users who can form legally binding contracts under applicable law. By using our services, you represent that you are at least 18 years old and have the legal authority to accept these terms.`,
  },
  {
    title: "2. Use License",
    content: `Subject to these Terms of Service, WorkFusion grants you a limited, non-exclusive, non-transferable license to:

• Access and use our services for your internal business purposes
• Create and manage automation workflows
• Process documents and data through our platform
• Access our API and documentation

This license is subject to your continued compliance with these terms.`,
  },
  {
    title: "3. User Obligations",
    content: `As a user of our services, you agree to:

• Provide accurate and complete information
• Maintain the security of your account credentials
• Comply with all applicable laws and regulations
• Not misuse or attempt to hack our services
• Not infringe on intellectual property rights
• Not use our services for illegal activities`,
  },
  {
    title: "4. Intellectual Property",
    content: `WorkFusion and its licensors retain all rights, title, and interest in:

• Our services and technology
• All related intellectual property
• Trademarks and branding
• Documentation and materials

You may not copy, modify, or create derivative works without our permission.`,
  },
  {
    title: "5. Payment Terms",
    content: `For paid services:

• Fees are based on your subscription plan
• Payments are non-refundable
• We may change pricing with 30 days notice
• You're responsible for all applicable taxes
• Late payments may result in service suspension`,
  },
  {
    title: "6. Limitation of Liability",
    content: `To the maximum extent permitted by law:

• We provide services "as is" without warranties
• We're not liable for indirect or consequential damages
• Our total liability is limited to fees paid in the last 12 months
• We don't guarantee uninterrupted service
• We're not responsible for third-party services`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Terms of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Service
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
            Please read these Terms of Service carefully before using WorkFusion's
            services. These terms govern your access to and use of our platform,
            including our website, API, and automation services.
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
              Questions or Concerns?
            </h2>
            <p className="text-gray-400 mb-6">
              If you have any questions about these Terms of Service, please contact our legal team:
            </p>
            <ul className="text-gray-400 space-y-2">
              <li>Email: legal@workfusion.com</li>
              <li>Address: 123 Innovation Drive, San Francisco, CA 94105</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
