"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import OpenAI from "openai";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight, materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import * as z from "zod";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { toast } from "react-hot-toast";
import { formSchema } from "./constants";
import { cn } from "@/lib/utils";
import useProModal from "@/hooks/use-pro-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CodeBlockProps {
  code: string;
  language: string;
  theme: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme }) => (
  <div className="relative">
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2"
      onClick={() => navigator.clipboard.writeText(code).then(() => toast.success("Code copied!"))}
    >
      Copy
    </Button>
    <div className="rounded-md overflow-hidden">
      <pre style={{ margin: 0, background: 'transparent' }}>
        <code className={`language-${language}`}>
          <SyntaxHighlighter
            PreTag="div"
            language={language}
            style={theme === "materialLight" ? materialLight : materialDark}
            customStyle={{ margin: 0, background: 'transparent' }}
          >
            {code}
          </SyntaxHighlighter>
        </code>
      </pre>
    </div>
  </div>
);

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<OpenAI.Chat.ChatCompletionMessageParam[]>([]);
  const [sandboxCode, setSandboxCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("materialLight");
  const [autoFormat, setAutoFormat] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: OpenAI.Chat.ChatCompletionMessageParam = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      const { data } = await axios.post("/api/code", { messages: newMessages });

      setMessages((current) => [...current, userMessage, data]);
      setSandboxCode(data.content || "");
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Error: Unable to generate code. Please try again.");
      }
    } finally {
      router.refresh();
    }
  };

  const handleSandboxRun = () => {
    if (iframeRef.current) {
      try {
        const iframeDocument = iframeRef.current.contentDocument;
        const iframeWindow = iframeRef.current.contentWindow;

        if (iframeDocument && iframeWindow) {
          iframeDocument.open();
          iframeDocument.write(sandboxCode);
          iframeDocument.close();
        }
      } catch {
        toast.error("Error: Unable to execute the code in the sandbox.");
      }
    }
  };

  const handleCopyOrDownload = (code: string, action: "copy" | "download") => {
    if (action === "copy") {
      navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard!");
    } else {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatCode = (code: string): string => {
    // Simple indentation-based formatting
    try {
      const lines = code.split('\n');
      let indentLevel = 0;
      const indentSize = 2;
      
      return lines.map(line => {
        // Decrease indent for closing braces/brackets
        if (line.trim().match(/^[}\])]/) && indentLevel > 0) {
          indentLevel--;
        }
        
        // Add current indentation
        const formatted = ' '.repeat(indentLevel * indentSize) + line.trim();
        
        // Increase indent for opening braces/brackets
        if (line.trim().match(/[{\[(]$/)) {
          indentLevel++;
        }
        
        return formatted;
      }).join('\n');
    } catch (error) {
      console.error('Error formatting code:', error);
      return code;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
        <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">WorkFusion Code</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            Start a conversation by entering a prompt below.
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoFormat(!autoFormat)}
                className={cn(
                  "text-xs",
                  autoFormat && "text-green-500"
                )}
              >
                Auto Format
              </Button>
            </div>
          </div>
          {messages.map((message, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-x-4 rounded-lg p-4",
                message.role === "user" ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <div className="flex-1 space-y-2">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      if (inline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                      
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = Array.isArray(children) ? children.join("") : String(children);
                      const lang = match ? match[1] : language;
                      const formattedCode = formatCode(codeString);
                      
                      return (
                        <CodeBlock
                          code={formattedCode}
                          language={lang}
                          theme={theme}
                        />
                      );
                    },
                  }}
                >
                  {message.content as string}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isLoading && (
          <div className="flex justify-center mt-4">
            <Loader />
          </div>
        )}
      </main>

      <footer className="p-4 bg-white dark:bg-gray-800 shadow-inner">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center gap-2"
          aria-label="Code generation form"
        >
          <Input
            {...form.register("prompt")}
            placeholder="Enter your code prompt here..."
            className="flex-1"
            disabled={isLoading}
            aria-label="Code generation input"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            aria-label="Send prompt"
          >
            {isLoading ? <Loader className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </footer>

      <aside className="p-4 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sandbox Preview</h2>
        <textarea
          className="w-full h-32 p-2 mt-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          value={sandboxCode}
          onChange={(e) => setSandboxCode(e.target.value)}
          aria-label="Sandbox code editor"
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            onClick={handleSandboxRun}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Run Code
          </Button>
          <Button
            onClick={() => handleCopyOrDownload(sandboxCode, "copy")}
            variant="outline"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Copy
          </Button>
          <Button
            onClick={() => handleCopyOrDownload(sandboxCode, "download")}
            variant="outline"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            Download
          </Button>
        </div>
        <iframe
          ref={iframeRef}
          className="w-full h-64 mt-4 border rounded-lg bg-white dark:bg-gray-700"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
          title="Code Execution Sandbox"
        />
      </aside>
    </div>
  );
};

export default CodePage;