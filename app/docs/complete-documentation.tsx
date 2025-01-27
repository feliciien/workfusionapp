"use client";

import { LandingNavbar } from "@/components/landing-navbar";

export default function CompleteDocumentationPage() {
  return (
    <div>
      <LandingNavbar />
      <main className='max-w-3xl mx-auto py-8 px-4'>
        <h1 className='text-4xl font-bold mb-6'>
          WorkFusion Platform Documentation
        </h1>

        <p className='mb-4'>
          Welcome to WorkFusion - your comprehensive AI-powered platform
          designed to enhance productivity and creativity through advanced
          automation and intelligent tools.
        </p>

        <h2 className='text-2xl font-semibold mb-4'>Getting Started</h2>
        <ol className='list-decimal pl-6 mb-6 space-y-2'>
          <li>Create your account by clicking the "Sign Up" button</li>
          <li>Verify your email address through the confirmation link</li>
          <li>Log in to access your personalized dashboard</li>
          <li>Explore our features and start your AI journey</li>
        </ol>

        <h2 className='text-2xl font-semibold mb-4'>Key Features</h2>
        <ul className='list-disc pl-6 mb-6 space-y-2'>
          <li>AI-Powered Chat Assistant - Get instant help and answers</li>
          <li>Code Generation Tools - Automate your development workflow</li>
          <li>
            Content Creation Services - Generate high-quality content
            efficiently
          </li>
          <li>
            Image and Music Generation - Create unique visual and audio content
          </li>
          <li>
            Voice Synthesis and Translation - Break language barriers seamlessly
          </li>
        </ul>

        <h2 className='text-2xl font-semibold mb-4'>Support</h2>
        <p className='mb-4'>
          Need help? Our dedicated support team is here for you. Contact us at{" "}
          <a
            href='mailto:workfusionapp@gmail.com'
            className='text-blue-600 underline'>
            workfusionapp@gmail.com
          </a>{" "}
          for prompt assistance.
        </p>

        <h2 className='text-2xl font-semibold mb-4'>Stay Connected</h2>
        <p className='mb-4'>
          Follow us on social media to stay updated with the latest features,
          tips, and community highlights. Join our growing community of
          innovators and creators.
        </p>
      </main>
    </div>
  );
}
