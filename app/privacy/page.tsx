import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Data Collection & Storage</h2>
        <p className="mb-4">WorkFusionApp is designed with privacy in mind:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>We do not store any personal data</li>
          <li>All data processing is done in real-time</li>
          <li>No user information is retained after sessions</li>
          <li>We only process data necessary for the immediate operation of the service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Process Information</h2>
        <p className="mb-4">Our application:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Processes data only during active sessions</li>
          <li>Does not maintain any persistent storage of user data</li>
          <li>Uses temporary processing only for immediate service functionality</li>
          <li>Clears all session data upon completion</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
        <p className="mb-4">While we don't store personal data, we interact with:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Jira API for task management</li>
          <li>GitHub API for code integration</li>
          <li>Slack API for notifications</li>
          <li>All interactions are processed in real-time without data retention</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">We maintain security through:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>End-to-end encryption for all data in transit</li>
          <li>No persistent storage of user data</li>
          <li>Regular security audits of our processing systems</li>
          <li>Immediate data clearing after processing</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
        <p className="mb-4">
          For questions about our privacy practices, contact us at:{" "}
          <a href="mailto:privacy@workfusionapp.com" className="text-blue-600 hover:underline">
            privacy@workfusionapp.com
          </a>
        </p>
      </section>

      <footer className="text-sm text-gray-600">
        Last updated: January 5, 2025
      </footer>
    </div>
  );
}
