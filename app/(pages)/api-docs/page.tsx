'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const endpoints = [
  {
    category: "Authentication",
    items: [
      {
        name: "Generate API Key",
        method: "POST",
        path: "/v1/auth/keys",
        description: "Generate a new API key for authentication",
      },
      {
        name: "Verify Token",
        method: "GET",
        path: "/v1/auth/verify",
        description: "Verify an authentication token",
      },
    ],
  },
  {
    category: "Workflows",
    items: [
      {
        name: "List Workflows",
        method: "GET",
        path: "/v1/workflows",
        description: "Retrieve a list of all workflows",
      },
      {
        name: "Create Workflow",
        method: "POST",
        path: "/v1/workflows",
        description: "Create a new workflow",
      },
      {
        name: "Get Workflow",
        method: "GET",
        path: "/v1/workflows/{id}",
        description: "Get details of a specific workflow",
      },
    ],
  },
  {
    category: "Documents",
    items: [
      {
        name: "Upload Document",
        method: "POST",
        path: "/v1/documents",
        description: "Upload a document for processing",
      },
      {
        name: "Process Document",
        method: "POST",
        path: "/v1/documents/{id}/process",
        description: "Start processing a document",
      },
    ],
  },
];

const methodColors = {
  GET: "bg-green-500/20 text-green-400 border-green-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function APIPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0].items[0]);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            API
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {" "}Reference
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive documentation for the WorkFusion REST API. Build and
            integrate automation solutions with our powerful API.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                {endpoints.map((category) => (
                  <div key={category.category}>
                    <h3 className="px-4 py-3 bg-gray-700/50 text-white font-semibold">
                      {category.category}
                    </h3>
                    <ul className="p-2">
                      {category.items.map((endpoint) => (
                        <li key={endpoint.path}>
                          <button
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`w-full px-4 py-2 rounded-lg text-left ${
                              selectedEndpoint === endpoint
                                ? "bg-purple-500/20 text-purple-400"
                                : "text-gray-400 hover:bg-gray-700/50"
                            }`}
                          >
                            {endpoint.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              {/* Endpoint Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className={`px-3 py-1 rounded-lg border ${
                      methodColors[selectedEndpoint.method]
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-gray-300">{selectedEndpoint.path}</code>
                </div>
                <p className="text-gray-400">{selectedEndpoint.description}</p>
              </div>

              {/* Request Example */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Request Example
                </h3>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-purple-400">
                    {`curl -X ${selectedEndpoint.method} \\
  https://api.workfusion.com${selectedEndpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </code>
                </pre>
              </div>

              {/* Response Example */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Response Example
                </h3>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <code className="text-purple-400">
                    {`{
  "status": "success",
  "data": {
    "id": "wf_123456",
    "created_at": "2025-01-05T12:00:00Z",
    "status": "active"
  }
}`}
                  </code>
                </pre>
              </div>
            </div>

            {/* SDK Examples */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                SDK Examples
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">JavaScript</h4>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <code className="text-purple-400">
                      {`import { WorkFusion } from '@workfusion/sdk';

const wf = new WorkFusion({ apiKey: 'YOUR_API_KEY' });
const response = await wf.workflows.create({
  name: 'My Workflow',
  description: 'A sample workflow'
});`}
                    </code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Python</h4>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <code className="text-purple-400">
                      {`from workfusion import WorkFusion

wf = WorkFusion(api_key='YOUR_API_KEY')
response = wf.workflows.create(
    name='My Workflow',
    description='A sample workflow'
)`}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
