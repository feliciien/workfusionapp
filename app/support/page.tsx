import React from 'react';

export default function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        
        <div className="mb-8">
          <p className="mb-4">
            Need help? Our support team is available 24/7 to assist you. You can reach us through:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email: <a href="mailto:support@workfusionapp.com" className="text-blue-600 hover:underline">support@workfusionapp.com</a></li>
            <li>Response time: Within 24 hours</li>
          </ul>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">What are your support hours?</h3>
            <p className="text-gray-600">Our team is available 24/7 to help you with any questions or issues.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">How quickly do you respond?</h3>
            <p className="text-gray-600">We aim to respond to all inquiries within 24 hours.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do you offer priority support?</h3>
            <p className="text-gray-600">Yes, enterprise customers receive priority support with faster response times.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
