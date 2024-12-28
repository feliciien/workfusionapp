"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Copy, Check, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import * as z from "zod";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import useProModal from "@/hooks/use-pro-modal";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tools } from "@/app/(dashboard)/(routes)/dashboard/config";
import { ToolPage } from "@/components/tool-page";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});

const LANGUAGES = {
  typescript: { name: 'TypeScript', mode: 'text/typescript' },
  javascript: { name: 'JavaScript', mode: 'text/javascript' },
  python: { name: 'Python', mode: 'text/x-python' },
  html: { name: 'HTML', mode: 'text/html' },
  css: { name: 'CSS', mode: 'text/css' },
  sql: { name: 'SQL', mode: 'text/x-sql' },
};

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewCode, setPreviewCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const codeTool = tools.find(t => t.href === '/code');

  if (!codeTool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>Code tool configuration not found</p>
      </div>
    );
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const userMessage: Message = {
        role: "user",
        content: `Generate ${LANGUAGES[language as keyof typeof LANGUAGES].name} code for: ${values.prompt}`,
      };

      const newMessages = [...messages, userMessage];
      
      const response = await axios.post("/api/code", {
        messages: newMessages,
        language,
      });

      if (response.data) {
        const assistantMessage = response.data;
        setMessages((current) => [...current, userMessage, assistantMessage]);
        
        const code = extractCode(assistantMessage.content);
        if (code) {
          setPreviewCode(code);
          updatePreview(code);
        }
      }

      form.reset();

    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractCode = (content: string): string => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
    const matches = Array.from(content.matchAll(codeBlockRegex));
    return matches.length > 0 ? matches.map(match => match[1].trim()).join('\n\n') : '';
  };

  const updatePreview = (code: string) => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      iframeDoc.open();
      
      if (language === 'html' || code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
        iframeDoc.write(code);
      } else {
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css">
              <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"><\/script>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  padding: 20px;
                  line-height: 1.6;
                  color: #333;
                  background: #1a1a1a;
                  color: #fff;
                }
                pre {
                  background: #2d2d2d;
                  padding: 15px;
                  border-radius: 8px;
                  overflow-x: auto;
                  margin: 20px 0;
                }
                code {
                  font-family: 'Fira Code', 'Consolas', monospace;
                }
                .error { 
                  color: #ff4444;
                  background: rgba(255,68,68,0.1);
                  padding: 12px;
                  border-radius: 6px;
                  border-left: 4px solid #ff4444;
                  margin: 10px 0;
                }
                .output {
                  background: #2d2d2d;
                  padding: 15px;
                  border-radius: 8px;
                  margin-top: 20px;
                  border: 1px solid #444;
                }
                .success {
                  color: #00ff00;
                  background: rgba(0,255,0,0.1);
                  padding: 12px;
                  border-radius: 6px;
                  border-left: 4px solid #00ff00;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <pre><code class="language-${language}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
              <div id="output" class="output"></div>
              <script>
                hljs.highlightAll();
                try {
                  const result = eval(\`${code}\`);
                  if (result !== undefined) {
                    document.getElementById('output').innerHTML = 
                      '<div class="success">Output:</div><pre>' + 
                      JSON.stringify(result, null, 2) + '</pre>';
                  }
                } catch (error) {
                  document.getElementById('output').innerHTML = 
                    '<div class="error">Error: ' + error.message + '</div>';
                }
              </script>
            </body>
          </html>
        `);
      }
      
      iframeDoc.close();
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Error updating preview');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const toggleFullscreen = () => {
    if (!previewRef.current) return;

    if (!isFullscreen) {
      if (previewRef.current.requestFullscreen) {
        previewRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <ToolPage tool={codeTool} isLoading={isLoading}>
      <div className="flex h-full">
        <div className={cn(
          "flex flex-col flex-1 p-4",
          isFullscreen ? "hidden" : "block"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">Code Generator</h1>
              <Code className="w-6 h-6" />
            </div>
            <Select
              value={language}
              onValueChange={setLanguage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={cn(
                "p-4 rounded-lg",
                message.role === "user" ? "bg-gray-800" : "bg-gray-700"
              )}>
                <div className="flex items-center space-x-2 mb-2">
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <span className="text-sm">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                </div>
                <ReactMarkdown 
                  className="text-sm prose prose-invert"
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="relative my-2">
                        <pre {...props} className="bg-black/10 rounded-lg p-4 overflow-x-auto" />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <code {...props} className="bg-black/10 rounded-lg p-1" />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              disabled={isLoading}
              placeholder={`Generate ${LANGUAGES[language as keyof typeof LANGUAGES].name} code for...`}
              {...form.register("prompt")}
              className="flex-1"
            />
            <Button disabled={isLoading} type="submit">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Generate"}
            </Button>
          </form>
        </div>

        <div 
          ref={previewRef}
          className={cn(
            "border-l border-gray-800 bg-gray-900",
            isFullscreen ? "w-screen h-screen fixed inset-0 z-50" : "w-1/2 p-4"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className={cn(
            "rounded-lg overflow-hidden bg-white h-[calc(100%-3rem)]",
            isFullscreen ? "w-full" : ""
          )}>
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </ToolPage>
  );
};

export default CodePage;