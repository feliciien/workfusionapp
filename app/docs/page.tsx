"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LandingNavbar } from "@/components/landing-navbar";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Import the Prism theme as a default import
import prism from "react-syntax-highlighter/dist/esm/styles/prism";

interface DocSection {
  title: string;
  id: string;
}

interface Section {
  title: string;
  items: DocSection[];
}

interface DocContent {
  [key: string]: {
    title: string;
    content: string;
  };
}

const sections: Section[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", id: "introduction" },
      { title: "Quick Start", id: "quick-start" },
      { title: "Installation", id: "installation" },
      { title: "Authentication", id: "authentication" },
    ],
  },
  // ... (other sections unchanged)
];

const DocContent: DocContent = {
  // ... (DocContent remains the same)
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <nav className="space-y-8">
                {filteredSections.map((section) => (
                  <div key={section.title}>
                    <h5 className="font-medium text-gray-900 mb-2">
                      {section.title}
                    </h5>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-gray-600 hover:text-gray-900",
                              activeSection === item.id &&
                                "bg-gray-100 text-gray-900"
                            )}
                            onClick={() => setActiveSection(item.id)}
                          >
                            {item.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-gray max-w-none"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                {DocContent[activeSection]?.title}
              </h1>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={prism as Record<string, React.CSSProperties>}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {DocContent[activeSection]?.content || ""}
              </ReactMarkdown>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
