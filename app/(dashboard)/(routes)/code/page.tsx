"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Copy, Check, RefreshCw, Maximize2, Minimize2, Download, Share2, Bookmark, BookmarkCheck, RotateCcw } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface SavedCode {
  id: string;
  title: string;
  code: string;
  language: string;
  timestamp: Date;
}

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
});

const LANGUAGES = {
  typescript: { name: 'TypeScript', mode: 'text/typescript', icon: '📘' },
  javascript: { name: 'JavaScript', mode: 'text/javascript', icon: '📒' },
  python: { name: 'Python', mode: 'text/x-python', icon: '🐍' },
  html: { name: 'HTML', mode: 'text/html', icon: '🌐' },
  css: { name: 'CSS', mode: 'text/css', icon: '🎨' },
  sql: { name: 'SQL', mode: 'text/x-sql', icon: '📊' },
};

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewCode, setPreviewCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [codeTitle, setCodeTitle] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadSavedCodes = () => {
      const saved = localStorage.getItem('savedCodes');
      if (saved) {
        setSavedCodes(JSON.parse(saved));
      }
    };
    loadSavedCodes();
  }, []);

  const saveCode = () => {
    if (!previewCode) {
      toast.error("No code to save");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveCode = () => {
    if (!codeTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const newCode: SavedCode = {
      id: Date.now().toString(),
      title: codeTitle,
      code: previewCode,
      language,
      timestamp: new Date(),
    };

    const updatedCodes = [...savedCodes, newCode];
    setSavedCodes(updatedCodes);
    localStorage.setItem('savedCodes', JSON.stringify(updatedCodes));
    setShowSaveDialog(false);
    setCodeTitle("");
    toast.success("Code saved successfully");
  };

  const loadSavedCode = (code: SavedCode) => {
    setPreviewCode(code.code);
    setLanguage(code.language);
    updatePreview(code.code);
    setShowHistory(false);
    toast.success("Code loaded successfully");
  };

  const deleteSavedCode = (id: string) => {
    const updatedCodes = savedCodes.filter(code => code.id !== id);
    setSavedCodes(updatedCodes);
    localStorage.setItem('savedCodes', JSON.stringify(updatedCodes));
    toast.success("Code deleted successfully");
  };

  const shareCode = async () => {
    if (!previewCode) {
      toast.error("No code to share");
      return;
    }

    try {
      await navigator.clipboard.writeText(previewCode);
      toast.success("Code copied to clipboard for sharing");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const downloadCode = () => {
    if (!previewCode) {
      toast.error("No code to download");
      return;
    }

    const blob = new Blob([previewCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Code downloaded successfully");
  };

  const undoLastMessage = () => {
    if (messages.length === 0) return;
    const newMessages = messages.slice(0, -2); // Remove last user and assistant message
    setMessages(newMessages);
    if (newMessages.length === 0) {
      setPreviewCode("");
    } else {
      const lastAssistantMessage = newMessages.findLast(m => m.role === "assistant");
      if (lastAssistantMessage) {
        const code = extractCode(lastAssistantMessage.content);
        if (code) {
          setPreviewCode(code);
          updatePreview(code);
        }
      }
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const codeTool = tools.find(t => t.href === '/code');

  if (!codeTool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>Code tool configuration not found</p>
      </div>
    );
  }

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

  return (
    <ToolPage tool={codeTool} isLoading={isLoading}>
      <div className="flex h-full">
        <div className="flex flex-col flex-1 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition"></div>
                <div className="relative p-2 bg-black rounded-lg ring-1 ring-white/10">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Code Generator</h1>
                <p className="text-sm text-white/40">Generate code in multiple languages</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={undoLastMessage}
                disabled={messages.length === 0 || isLoading}
                className="hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                History
              </Button>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white/80 hover:bg-black/60 transition-colors">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10">
                  {Object.entries(LANGUAGES).map(([key, value]) => (
                    <SelectItem 
                      key={key} 
                      value={key} 
                      className="text-white/80 hover:bg-white/5 focus:bg-white/5 focus:text-white"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{value.icon}</span>
                        {value.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-2xl ring-1 ring-white/10">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30"></div>
                      <div className="relative p-4 bg-black/40 rounded-xl">
                        <Code className="w-12 h-12 text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mt-6 mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Start Coding</h3>
                    <p className="text-white/40 max-w-sm mb-8">
                      Generate code in your preferred programming language. Just describe what you want to create.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(LANGUAGES).map(([key, value]) => (
                        <Button
                          key={key}
                          variant="ghost"
                          size="sm"
                          onClick={() => setLanguage(key)}
                          className={cn(
                            "hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200",
                            language === key && "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                          )}
                        >
                          {value.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative group",
                      "animate-in slide-in-from-bottom-5",
                    )}
                  >
                    <div className={cn(
                      "absolute -inset-1 rounded-2xl blur opacity-20 transition duration-200",
                      message.role === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 group-hover:opacity-30" 
                        : "bg-gradient-to-r from-gray-500 to-gray-400 group-hover:opacity-30"
                    )} />
                    <div className="relative p-6 bg-black/40 backdrop-blur-xl rounded-2xl ring-1 ring-white/10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={cn(
                          "relative",
                          message.role === "user" ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-gray-500 to-gray-400"
                        )}>
                          <div className="absolute -inset-0.5 rounded-lg blur opacity-50"></div>
                          <div className="relative p-1 bg-black/40 rounded-lg ring-1 ring-white/10">
                            {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white/80">
                            {message.role === "user" ? "You" : "Assistant"}
                          </span>
                          <span className="text-xs text-white/30">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <ReactMarkdown 
                        className="text-sm prose prose-invert max-w-full break-words whitespace-pre-wrap prose-pre:my-0"
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="relative my-3 group">
                              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-30 group-hover:opacity-40 transition duration-200"></div>
                              <pre 
                                {...props} 
                                className="relative bg-black/40 backdrop-blur-xl rounded-xl p-4 overflow-x-auto whitespace-pre-wrap ring-1 ring-white/10"
                              />
                              <Button
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const code = props.children?.toString() || "";
                                  navigator.clipboard.writeText(code);
                                  toast.success("Code copied to clipboard");
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ),
                          code: ({ node, ...props }) => (
                            <code {...props} className="bg-black/40 rounded-md px-1.5 py-0.5 whitespace-pre-wrap text-white/80 ring-1 ring-white/10" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 bg-black/20 backdrop-blur-xl px-8 py-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-200"></div>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      placeholder={`Generate ${LANGUAGES[language as keyof typeof LANGUAGES].name} code for...`}
                      {...form.register("prompt")}
                      className="w-full bg-black/40 border-white/10 text-white/80 placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 pr-24"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />
                    {isLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RefreshCw className="w-4 h-4 animate-spin text-white/40" />
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  disabled={isLoading} 
                  type="submit"
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                  <span className="relative px-4 py-1.5 bg-black rounded-lg text-white ring-1 ring-white/10 font-medium">
                    Generate
                  </span>
                </Button>
              </div>
              {form.formState.errors.prompt && (
                <p className="text-red-400 text-sm mt-2 pl-1">
                  {form.formState.errors.prompt.message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div 
          ref={previewRef}
          className={cn(
            "border-l border-white/5 bg-black",
            isFullscreen ? "w-screen h-screen fixed inset-0 z-50" : "w-[50%]"
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Preview</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={saveCode}
                className="h-8 w-8 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={shareCode}
                className="h-8 w-8 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadCode}
                className="h-8 w-8 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
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
            "h-[calc(100%-4rem)]",
            isFullscreen ? "w-full" : ""
          )}>
            <iframe
              ref={iframeRef}
              className="w-full h-full bg-white"
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-gray-900 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Save Code</DialogTitle>
              <DialogDescription className="text-white/60">
                Give your code a title to save it for later use.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your code"
                  value={codeTitle}
                  onChange={(e) => setCodeTitle(e.target.value)}
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowSaveDialog(false)}
                className="text-white/80 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCode}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <span className="relative px-4 py-1.5 bg-black rounded-lg text-white ring-1 ring-white/10 font-medium">
                  Save
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="bg-gray-900 border border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Saved Code History</DialogTitle>
              <DialogDescription className="text-white/60">
                View and manage your saved code snippets.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {savedCodes.length === 0 ? (
                <p className="text-white/40 text-center py-4">No saved codes yet</p>
              ) : (
                savedCodes.map((code) => (
                  <div
                    key={code.id}
                    className="relative group p-4 bg-black/40 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{code.title}</h3>
                        <p className="text-white/40 text-sm">
                          {LANGUAGES[code.language as keyof typeof LANGUAGES].icon} {LANGUAGES[code.language as keyof typeof LANGUAGES].name} • {new Date(code.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadSavedCode(code)}
                          className="text-white/80 hover:text-white hover:bg-white/5"
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedCode(code.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slide-in-from-bottom-5 {
          from {
            transform: translateY(5%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation: slide-in-from-bottom-5 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </ToolPage>
  );
};

export default CodePage;