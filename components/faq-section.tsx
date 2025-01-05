"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is WorkFusion?",
    answer:
      "WorkFusion is an advanced AI platform that helps businesses automate tasks, generate content, and boost productivity. Our suite of AI tools includes code generation, image creation, chat assistance, and more.",
  },
  {
    question: "How does the pricing work?",
    answer:
      "We offer flexible pricing plans with a 14-day free trial. Our Pro plan includes unlimited access to all features, priority processing, and premium support. You can choose between monthly or yearly billing, with significant savings on annual plans.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security very seriously. We use enterprise-grade encryption, secure data centers, and follow industry best practices to protect your information. Your data is never shared with third parties without your explicit consent.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes, we provide 24/7 customer support. Free users have access to our community forums and documentation, while Pro users get priority email and chat support with faster response times.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to Pro features until the end of your current billing period. We don't offer refunds for partial months.",
  },
  {
    question: "What types of AI models do you use?",
    answer:
      "We use state-of-the-art AI models and continuously update them to provide the best results. This includes advanced language models for text generation, computer vision models for image processing, and specialized models for specific tasks.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-white" id="faq">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about WorkFusion
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
