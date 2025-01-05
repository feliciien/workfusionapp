'use client';

import { motion } from "framer-motion";
import Image from "next/image";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "WorkFusion has transformed how we handle our business processes. The AI capabilities are truly revolutionary.",
      author: "Sarah Johnson",
      role: "CTO, TechCorp",
      image: "/testimonials/sarah.jpg"
    },
    {
      quote: "The integration was seamless, and the results were immediate. Our productivity has increased by 300%.",
      author: "Michael Chen",
      role: "Director of Operations, InnovateX",
      image: "/testimonials/michael.jpg"
    },
    {
      quote: "WorkFusion's enterprise AI solutions have given us a competitive edge in our market.",
      author: "Emily Rodriguez",
      role: "CEO, FutureScale",
      image: "/testimonials/emily.jpg"
    }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <motion.h2 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          What Our Clients Say
        </motion.h2>
        <motion.p 
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Success stories from industry leaders
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{testimonial.author}</h3>
                <p className="text-gray-400">{testimonial.role}</p>
              </div>
            </div>
            <blockquote className="text-gray-300 italic">"{testimonial.quote}"</blockquote>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
