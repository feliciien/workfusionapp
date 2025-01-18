"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Code,
  Copy,
  Check,
  RefreshCw,
  Download,
  Share2,
  Bookmark,
  RotateCcw,
} from "lucide-react";
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
import { tools } from "@/app/(dashboard)/(routes)/dashboard/config";
import { ToolPage } from "@/components/tool-page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { githubDark } from "@uiw/codemirror-theme-github";

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
  typescript: {
    name: "TypeScript",
    extension: javascript({ typescript: true }),
    icon: "📘",
  },
  javascript: { name: "JavaScript", extension: javascript(), icon: "📒" },
  python: { name: "Python", extension: python(), icon: "🐍" },
  html: { name: "HTML", extension: html(), icon: "🌐" },
  css: { name: "CSS", extension: css(), icon: "🎨" },
  sql: { name: "SQL", extension: sql(), icon: "📊" },
};

type LanguageKey = keyof typeof LANGUAGES;

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeContent, setCodeContent] = useState("");
  const [language, setLanguage] = useState<LanguageKey>("typescript");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [codeTitle, setCodeTitle] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadSavedCodes = () => {
      const saved = localStorage.getItem("savedCodes");
      if (saved) {
        setSavedCodes(JSON.parse(saved));
      }
    };
    loadSavedCodes();
  }, []);

  const extractCode = useCallback(
    (content: string): string => {
      const codeBlockRegex = new RegExp(
        `\`\`\`${language}\n([\\s\\S]*?)\n\`\`\``,
        "g"
      );
      const matches = Array.from(content.matchAll(codeBlockRegex));
      return matches.length > 0
        ? matches.map((match) => match[1].trim()).join("\n\n")
        : "";
    },
    [language]
  );

  const saveCode = useCallback(() => {
    if (!codeContent) {
      toast.error("No code to save");
      return;
    }
    setShowSaveDialog(true);
  }, [codeContent]);

  const handleSaveCode = useCallback(() => {
    if (!codeTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const newCode: SavedCode = {
      id: Date.now().toString(),
      title: codeTitle,
      code: codeContent,
      language,
      timestamp: new Date(),
    };

    const updatedCodes = [...savedCodes, newCode];
    setSavedCodes(updatedCodes);
    localStorage.setItem("savedCodes", JSON.stringify(updatedCodes));
    setShowSaveDialog(false);
    setCodeTitle("");
    toast.success("Code saved successfully");
  }, [codeTitle, codeContent, language, savedCodes]);

  const loadSavedCode = useCallback((code: SavedCode) => {
    setCodeContent(code.code);
    setLanguage(code.language as LanguageKey);
    toast.success("Code loaded successfully");
  }, []);

  const deleteSavedCode = useCallback(
    (id: string) => {
      const updatedCodes = savedCodes.filter((code) => code.id !== id);
      setSavedCodes(updatedCodes);
      localStorage.setItem("savedCodes", JSON.stringify(updatedCodes));
      toast.success("Code deleted successfully");
    },
    [savedCodes]
  );

  const shareCode = useCallback(async () => {
    if (!codeContent) {
      toast.error("No code to share");
      return;
    }

    try {
      await navigator.clipboard.writeText(codeContent);
      toast.success("Code copied to clipboard for sharing");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  }, [codeContent]);

  const downloadCode = useCallback(() => {
    if (!codeContent) {
      toast.error("No code to download");
      return;
    }

    const blob = new Blob([codeContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Code downloaded successfully");
  }, [codeContent, language]);

  const undoLastMessage = useCallback(() => {
    if (messages.length === 0) return;
    const newMessages = messages.slice(0, -2); // Remove last user and assistant message
    setMessages(newMessages);
    if (newMessages.length === 0) {
      setCodeContent("");
    } else {
      const lastAssistantMessage = [...newMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastAssistantMessage) {
        const code = extractCode(lastAssistantMessage.content);
        if (code) {
          setCodeContent(code);
        }
      }
    }
  }, [messages, extractCode]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  }, [codeContent]);

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
        content: `Generate ${LANGUAGES[language].name} code for: ${values.prompt}`,
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
          setCodeContent(code);
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

  const codeTool = tools.find((t) => t.href === "/code");

  return codeTool ? (
    <ToolPage tool={codeTool} isLoading={isLoading}>
      {/* Full JSX content goes here */}

      {/* Header */}
      <div className="flex h-full">
        <div className="flex flex-col flex-1 h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition"></div>
                <div className="relative p-2 bg-black rounded-lg ring-1 ring-white/10">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Code Generator
                </h1>
                <p className="text-sm text-white/40">
                  Generate and edit code with ease
                </p>
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
              <select
                aria-label="Select language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageKey)}
                className="bg-black/40 border-white/10 text-white/80 hover:bg-black/60 transition-colors rounded-md px-3 py-2 focus:outline-none"
              >
                {Object.entries(LANGUAGES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {value.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message List */}
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
                    <h3 className="text-2xl font-semibold mt-6 mb-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                      Start Coding
                    </h3>
                    <p className="text-white/40 max-w-sm mb-8">
                      Generate and edit code in your preferred programming
                      language.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(LANGUAGES).map(([key, value]) => (
                        <Button
                          key={key}
                          variant="ghost"
                          size="sm"
                          onClick={() => setLanguage(key as LanguageKey)}
                          className={cn(
                            "hover:bg-white/5 text-white/60 hover:text-white transition-all duration-200",
                            language === key &&
                              "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
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
                    className="relative group animate-in slide-in-from-bottom-5"
                  >
                    <div
                      className={cn(
                        "absolute -inset-1 rounded-2xl blur opacity-20 transition duration-200",
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 group-hover:opacity-30"
                          : "bg-gradient-to-r from-gray-500 to-gray-400 group-hover:opacity-30"
                      )}
                    />
                    <div className="relative p-6 bg-black/40 backdrop-blur-xl rounded-2xl ring-1 ring-white/10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div
                          className={cn(
                            "relative",
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500"
                              : "bg-gradient-to-r from-gray-500 to-gray-400"
                          )}
                        >
                          <div className="absolute -inset-0.5 rounded-lg blur opacity-50"></div>
                          <div className="relative p-1 bg-black/40 rounded-lg ring-1 ring-white/10">
                            {message.role === "user" ? (
                              <UserAvatar />
                            ) : (
                              <BotAvatar />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white/80">
                            {message.role === "user" ? "You" : "Assistant"}
                          </span>
                          <span className="text-xs text-white/30">
                            {message.timestamp
                              ? message.timestamp.toLocaleTimeString()
                              : new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <ReactMarkdown
                        className="text-sm prose max-w-full break-words whitespace-pre-wrap prose-pre:my-0 text-gray-200"
                        components={{
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) => {
                            return inline ? (
                              <code
                                {...props}
                                className="bg-black/40 rounded-md px-1.5 py-0.5 whitespace-pre-wrap text-white/80 ring-1 ring-white/10"
                              >
                                {children}
                              </code>
                            ) : (
                              <CodeMirror
                                value={codeContent}
                                extensions={[LANGUAGES[language].extension]}
                                theme={githubDark}
                                readOnly
                              />
                            );
                          },
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

          {/* Input Form */}
          <div className="border-t border-white/5 bg-black/20 backdrop-blur-xl px-8 py-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-200"></div>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      placeholder={`Generate ${LANGUAGES[language].name} code for...`}
                      {...form.register("prompt")}
                      className="w-full bg-black/40 border-white/10 text-white/80 placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 pr-24"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
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

        {/* Code Editor */}
        <div className="w-[50%] border-l border-white/5 bg-black">
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-xl">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Code Editor
            </h2>
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
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="h-[calc(100%-4rem)] p-4">
            <CodeMirror
              value={codeContent}
              extensions={[LANGUAGES[language].extension]}
              theme={githubDark}
              onChange={(value) => setCodeContent(value)}
            />
          </div>
        </div>

        {/* Save Dialog */}
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
                <Label htmlFor="title" className="text-white">
                  Title
                </Label>
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
              <Button onClick={handleSaveCode} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <span className="relative px-4 py-1.5 bg-black rounded-lg text-white ring-1 ring-white/10 font-medium">
                  Save
                </span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="bg-gray-900 border border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Saved Code History
              </DialogTitle>
              <DialogDescription className="text-white/60">
                View and manage your saved code snippets.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {savedCodes.length === 0 ? (
                <p className="text-white/40 text-center py-4">
                  No saved codes yet
                </p>
              ) : (
                savedCodes.map((code) => (
                  <div
                    key={code.id}
                    className="relative group p-4 bg-black/40 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">
                          {code.title}
                        </h3>
                        <p className="text-white/40 text-sm">
                          {LANGUAGES[code.language as LanguageKey].icon}{" "}
                          {LANGUAGES[code.language as LanguageKey].name} •{" "}
                          {new Date(code.timestamp).toLocaleDateString()}
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

      {/* Styles */}
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
          animation: slide-in-from-bottom-5 0.4s
            cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </ToolPage>
  ) : (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-500">Error</h2>
      <p>Code tool configuration not found</p>
    </div>
  );
};

export default CodePage;
