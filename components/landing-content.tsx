"use client";

import { features } from "@/constants";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import Image from "next/image";

export const LandingContent = () => {
  return (
    <div className='px-8 pb-20'>
      {/* Features Section */}
      <section className='mb-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Key Features to Boost Your Productivity
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Discover how our AI tools can transform your workflow
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='w-14 h-14 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-6'>
                <feature.icon className='text-purple-600 w-7 h-7' />
              </div>
              <h3 className='text-2xl font-semibold text-gray-900 mb-4'>
                {feature.title}
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-16 bg-gradient-to-b from-white to-gray-50 rounded-3xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='max-w-7xl mx-auto px-4'>
          <h2 className='text-4xl font-bold text-center text-gray-900 mb-4'>
            Loved by Industry Leaders
          </h2>
          <p className='text-xl text-center text-gray-600 max-w-2xl mx-auto mb-16'>
            Join thousands of professionals who are revolutionizing their work
            with our AI platform
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Testimonial Cards */}
            {[
              {
                text: "This service transformed our business! Highly recommended.",
                author: "Alice Smith",
                role: "Founder, Tech Innovators",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              },
              {
                text: "An essential tool that has boosted our productivity tenfold.",
                author: "Bob Johnson",
                role: "CEO, Business Solutions",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                text: "Exceptional service and support. A game-changer for our operations.",
                author: "Emma Davis",
                role: "CTO, Innovate LLC",
                image: "https://randomuser.me/api/portraits/women/65.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300'>
                <p className='text-gray-600 mb-6 text-lg italic'>
                  "{testimonial.text}"
                </p>
                <div className='flex items-center'>
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={56}
                    height={56}
                    className='rounded-full mr-4'
                  />
                  <div>
                    <h4 className='text-gray-900 font-bold text-lg'>
                      {testimonial.author}
                    </h4>
                    <p className='text-gray-600'>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <Analytics />
    </div>
  );
};

export default LandingContent;
