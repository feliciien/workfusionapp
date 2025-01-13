"use client";

import { LandingNavbar } from "@/components/landing-navbar";

export default function CompleteDocumentationPage() {
  return (
    <div>
      <LandingNavbar />
      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-6">Welcome to Our Platform</h1>

        <p className="mb-4">
          This platform is designed to provide you with powerful tools and features to enhance your productivity and creativity.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Sign up for an account on our website.</li>
          <li>Verify your email address.</li>
          <li>Log in to access your personalized dashboard.</li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>AI-Powered Chat Assistant</li>
          <li>Code Generation Tools</li>
          <li>Content Creation Services</li>
          <li>Image and Music Generation</li>
          <li>Voice Synthesis and Translation</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <p className="mb-4">
          If you have any questions or need assistance, please contact our support team at{" "}
          <a href="mailto:support@ourplatform.com" className="text-blue-600 underline">
            support@ourplatform.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Stay Connected</h2>
        <p>
          Follow us on social media to get the latest updates and news about our platform.
        </p>
      </main>
    </div>
  );
}
