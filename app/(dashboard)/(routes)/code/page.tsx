"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Send, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import * as z from "zod";
import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import useProModal from "@/hooks/use-pro-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import prettier from "prettier";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CodeBlockProps {
  code: string;
  language: string;
  theme: string;
  onFormat: (code: string, language: string) => Promise<string>;
}

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});

// Format code function
const formatCodeUtil = async (code: string, language: string): Promise<string> => {
  try {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        const formattedCode = await prettier.format(code, {
          parser: 'babel',
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
        });
        return formattedCode;
      case 'python':
        return code.trim().replace(/\n{3,}/g, '\n\n');
      default:
        return code.trim();
    }
  } catch (error) {
    console.warn('Code formatting error:', error);
    return code;
  }
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme, onFormat }) => {
  const [formattedContent, setFormattedContent] = useState(code);
  
  useEffect(() => {
    const formatAndSetCode = async () => {
      const formatted = await onFormat(code, language);
      setFormattedContent(formatted);
    };
    formatAndSetCode();
  }, [code, language, onFormat]);

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition"
        onClick={() => navigator.clipboard.writeText(formattedContent).then(() => toast.success("Code copied!"))}
      >
        <Copy className="w-4 h-4" />
      </Button>
      <pre className={cn(
        "bg-gray-900 rounded-lg p-4 overflow-x-auto",
        "text-sm text-gray-100"
      )}>
        <code>{formattedContent}</code>
      </pre>
    </div>
  );
};

const templates = [
  {
    name: "React Component",
    language: "typescript",
    template: `// React component template
import React from 'react';

interface Props {
  // Define your props here
}

export const Component: React.FC<Props> = (props) => {
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
};`
  },
  { name: "API Endpoint", language: "typescript", template: "import { NextApiRequest, NextApiResponse } from 'next';\n\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method !== 'POST') {\n    return res.status(405).json({ error: 'Method not allowed' });\n  }\n\n  try {\n    // Add your logic here\n    res.status(200).json({ success: true });\n  } catch (error) {\n    res.status(500).json({ error: 'Internal server error' });\n  }\n}" },
  { name: "Python Script", language: "python", template: "def main():\n    # Add your code here\n    pass\n\nif __name__ == '__main__':\n    main()" }
];

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sandboxCode, setSandboxCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("materialDark");
  const [autoFormat, setAutoFormat] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract code from markdown content
  const extractCode = (content: string): string => {
    const codeBlockRegex = /```(?:javascript|typescript)?\n([\s\S]*?)\n```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1].trim() : '';
  };

  // Update sandbox code when a message is added
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const code = extractCode(lastMessage.content);
      setSandboxCode(code);
    }
  }, [messages]);

  // Markdown component with code formatting
  const MarkdownWithCode: React.FC<{ content: string }> = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            if (inline) {
              return (
                <code className={cn("bg-gray-900/50 rounded px-1 py-0.5", className)} {...props}>
                  {children}
                </code>
              );
            }
            
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : language;
            const codeString = String(children).replace(/\n$/, '');
            
            return (
              <CodeBlock
                code={codeString}
                language={lang}
                theme={theme}
                onFormat={formatCodeUtil}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const handleSandboxRun = () => {
    if (!sandboxCode.trim()) {
      toast.error('Please enter some code to run');
      return;
    }

    try {
      // Create a sandboxed iframe environment
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Reset the iframe
      iframeDoc.open();

      // Check if the code contains HTML
      const hasHTML = sandboxCode.includes('<!DOCTYPE html>') || sandboxCode.includes('<html>');
      
      if (hasHTML) {
        // If it's HTML, write it directly
        iframeDoc.write(sandboxCode);
      } else {
        // If it's CSS, wrap it in HTML
        const cssCode = sandboxCode.includes('<style>') ? sandboxCode : `<style>${sandboxCode}</style>`;
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${cssCode}
            </head>
            <body>
              <div id="preview">
                <!-- Preview content will be added here -->
              </div>
            </body>
          </html>
        `);
      }
      
      iframeDoc.close();
      toast.success('Preview rendered successfully');
    } catch (error) {
      console.error('Sandbox error:', error);
      toast.error('Error rendering preview: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const onMessageRun = (message: Message) => {
    const code = extractCode(message.content);
    if (code) {
      setSandboxCode(code);
      handleSandboxRun();
    } else {
      toast.error('No executable code found in the message');
    }
  };

  // Message rendering component
  const renderMessage = (message: Message) => (
    <div 
      key={message.content}
      className={cn(
        "rounded-lg overflow-hidden",
        "border border-gray-700/50",
        "transition-all duration-200 ease-in-out",
        message.role === "user" 
          ? "bg-gray-800/50" 
          : "bg-gray-800/80 border-emerald-500/20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
          <span className="text-sm font-medium text-gray-300">
            {message.role === "user" ? "You" : "AI Assistant"}
          </span>
        </div>
        {message.role === "assistant" && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="text-xs border border-gray-700 hover:bg-gray-700/50"
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageRun(message)}
              className="text-xs border border-gray-700 hover:bg-gray-700/50"
            >
              Run
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <MarkdownWithCode content={message.content} />
      </div>
    </div>
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyOrDownload = async (code: string, action: 'copy' | 'download') => {
    if (!code.trim()) {
      toast.error('No code to ' + action);
      return;
    }

    try {
      if (action === 'copy') {
        await copyToClipboard(code);
      } else {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${language.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Code downloaded successfully');
      }
    } catch (error) {
      console.error(action + ' error:', error);
      toast.error(`Failed to ${action} code`);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];
      
      const response = await axios.post("/api/code", {
        messages: newMessages,
      });

      // Add a sample restaurant website code
      const sampleCode: Message = {
        role: "assistant",
        content: `Here's a modern restaurant website:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gourmet Dining</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }

        body {
            line-height: 1.6;
            color: #333;
        }

        header {
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800') center/cover;
            height: 100vh;
            color: white;
            text-align: center;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(0,0,0,0.8);
            padding: 1rem;
        }

        nav ul {
            list-style: none;
            display: flex;
            justify-content: center;
            gap: 2rem;
        }

        nav a {
            color: white;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s;
        }

        nav a:hover {
            color: #ffd700;
        }

        .hero-content h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
        }

        .hero-content p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }

        .cta-button {
            display: inline-block;
            padding: 1rem 2rem;
            background: #ffd700;
            color: #333;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: transform 0.3s;
        }

        .cta-button:hover {
            transform: translateY(-3px);
        }

        section {
            padding: 5rem 2rem;
            text-align: center;
        }

        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 2rem;
        }

        .menu-item {
            background: #f9f9f9;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <header id="home">
        <div class="hero-content">
            <h1>Gourmet Dining</h1>
            <p>Experience culinary excellence</p>
            <a href="#menu" class="cta-button">View Menu</a>
        </div>
    </header>

    <section id="menu">
        <h2>Our Menu</h2>
        <div class="menu-grid">
            <div class="menu-item">
                <h3>Appetizers</h3>
                <p>Delicious starters to begin your culinary journey</p>
            </div>
            <div class="menu-item">
                <h3>Main Course</h3>
                <p>Exquisite dishes crafted with passion</p>
            </div>
            <div class="menu-item">
                <h3>Desserts</h3>
                <p>Sweet endings to a perfect meal</p>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2024 Gourmet Dining. All rights reserved.</p>
    </footer>
</body>
</html>
\`\`\`

Click "Run" to see the restaurant website preview!`
      };

      setMessages([...newMessages, sampleCode]);
      form.reset();

    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="flex items-center p-6 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <Code className="w-8 h-8 text-emerald-400" />
        <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
          SynthAI Code Generator
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Language and Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-gray-100">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
              <Select 
                value={templates.find(t => t.language === language)?.name || ''} 
                onValueChange={(name) => {
                  const template = templates.find(t => t.name === name);
                  if (template) {
                    form.setValue('prompt', `Generate code similar to this template:\n\n${template.template}`);
                    setLanguage(template.language);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-gray-100">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {templates
                    .filter(t => t.language === language)
                    .map(template => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-300 mb-2">Settings</label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoFormat(!autoFormat)}
                  className={cn(
                    "text-sm border border-gray-700 hover:bg-gray-700/50",
                    autoFormat && "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  )}
                >
                  {autoFormat ? "Auto Format: ON" : "Auto Format: OFF"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "materialLight" ? "materialDark" : "materialLight")}
                  className="text-sm border border-gray-700 hover:bg-gray-700/50"
                >
                  {theme === "materialLight" ? "Light Theme" : "Dark Theme"}
                </Button>
              </div>
            </div>
          </div>

          {/* Code Generation Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                {...form.register("prompt")}
                placeholder="Describe the code you want to generate..."
                className="w-full h-24 py-4 px-6 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                style={{ resize: 'none' }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "absolute right-4 bottom-4",
                  "bg-gradient-to-r from-emerald-500 to-blue-500 text-white",
                  "hover:from-emerald-600 hover:to-blue-600",
                  "focus:ring-2 focus:ring-emerald-500/50",
                  "transition-all duration-200 ease-in-out",
                  "flex items-center space-x-2 px-6"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Code Output */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              renderMessage(message)
            ))}
          </div>
        </div>
      </main>

      {/* Code Sandbox */}
      <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">Code Sandbox</h2>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSandboxRun}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Run Code
                </Button>
                <Button
                  onClick={() => handleCopyOrDownload(sandboxCode, "copy")}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Copy
                </Button>
                <Button
                  onClick={() => handleCopyOrDownload(sandboxCode, "download")}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Download
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Code Editor</label>
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="w-full h-64 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg font-mono text-sm text-gray-100 resize-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  placeholder="Your code will appear here..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Output</label>
                <iframe
                  ref={iframeRef}
                  className="w-full h-64 bg-gray-800/50 border border-gray-700/50 rounded-lg"
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  title="Code Execution Sandbox"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;