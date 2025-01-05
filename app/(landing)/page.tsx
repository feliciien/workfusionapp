'use client';

import { Analytics } from '@vercel/analytics/react';
import { TrustedCompanies } from "@/components/trusted-companies";
import { ValueProposition } from "@/components/value-proposition";
import { IntegrationShowcase } from "@/components/integration-showcase";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CTASection } from "@/components/cta-section";
import Image from "next/image";

const features = [
  {
    title: "AI-Powered Automation",
    description: "Automate complex business processes with advanced AI and machine learning capabilities.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Smart Document Processing",
    description: "Extract and process information from documents with high accuracy using AI.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Advanced Analytics",
    description: "Gain insights from your data with powerful analytics and visualization tools.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with encryption, compliance, and access controls.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing tools and workflows.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "Get help anytime with our dedicated support team and resources.",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="w-full min-h-screen bg-gradient-to-b from-[#111827] to-[#1F2937] flex items-center">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your Business with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  AI-Powered Automation
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Streamline operations, reduce costs, and accelerate growth with our enterprise-grade AI solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Get Started Free
                </button>
                <button className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-2xl">
                    <div className="h-8 bg-purple-200/20 rounded-md mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-purple-200/20 rounded-md w-3/4"></div>
                      <div className="h-4 bg-purple-200/20 rounded-md w-1/2"></div>
                      <div className="h-4 bg-purple-200/20 rounded-md w-5/6"></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="h-20 bg-purple-200/20 rounded-md"></div>
                      <div className="h-20 bg-purple-200/20 rounded-md"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-300"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-200"></div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <ValueProposition />

      {/* Trusted Companies */}
      <TrustedCompanies />

      {/* Integration Showcase */}
      <IntegrationShowcase />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Features Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              Powerful Features for Enterprise Success
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in">
              Everything you need to automate and optimize your operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      <Analytics />
    </main>
  );
}
