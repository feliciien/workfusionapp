// Use client-side rendering
"use client";

import { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Copy,
  Check,
  Download,
  Share2,
  Bookmark,
  RotateCcw,
  Loader2,
  Save,
  FilePlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactMarkdown from "react-markdown";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import useProModal from "@/hooks/use-pro-modal";
import { tools, Tool } from "@/app/(dashboard)/(routes)/dashboard/config";
import { ToolPage } from "@/components/tool-page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import ReactCodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";

// Dynamically import the ReactLivePreview component
const ReactLivePreview = dynamic(
  () => import("@/components/react-live-preview"),
  { ssr: false }
) as React.ComponentType<ReactLivePreviewProps>;

interface ReactLivePreviewProps {
  code: string;
  language: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface SavedCode {
  id: string;
  title: string;
  code: string;
  language: LanguageKey;
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
    extension: "ts",
    icon: "📘",
  },
  javascript: {
    name: "JavaScript",
    extension: "js",
    icon: "📒",
  },
  html: {
    name: "HTML",
    extension: "html",
    icon: "🌐",
  },
} as const;

type LanguageKey = keyof typeof LANGUAGES;

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeContent, setCodeContent] = useState("");
  const [language, setLanguage] = useState<LanguageKey>("javascript");
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

  const extractCode = useCallback((content: string): string => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = content.match(codeBlockRegex);
    if (matches) {
      return matches
        .map((block) =>
          block.replace(/```[\w]*\n?([\s\S]*?)```/, "$1").trim()
        )
        .join("\n\n");
    } else {
      return "";
    }
  }, []);

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
    setLanguage(code.language);
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
    a.download = `code.${LANGUAGES[language].extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Code downloaded successfully");
  }, [codeContent, language]);

  const undoLastMessage = useCallback(() => {
    if (messages.length === 0) return;
    const newMessages = messages.slice(0, -2);
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

      let prompt = "";
      const languageData = LANGUAGES[language];

      if (language === "html") {
        prompt = `Generate HTML code for: ${values.prompt}`;
      } else if (language === "javascript" || language === "typescript") {
        prompt = `Generate a complete HTML page including ${languageData.name} and CSS for: ${values.prompt}`;
      } else {
        prompt = `Generate ${languageData.name} code for: ${values.prompt}`;
      }

      const userMessage: Message = {
        role: "user",
        content: prompt,
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
        } else {
          toast.error("No code found in the assistant's response.");
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

  const codeTool: Tool | undefined = tools.find((t) => t.href === "/code");

  if (!codeTool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>Code tool configuration not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Google Tag */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-6RZH54WYJJ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6RZH54WYJJ');
        `}
      </Script>

      <ToolPage tool={codeTool as Tool} isLoading={isLoading}>
        {/* Main Container */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel */}
          <div className="md:w-1/2 p-4 space-y-4">
            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Input
                placeholder="Describe what you want to generate..."
                {...form.register("prompt")}
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {(["javascript", "typescript", "html"] as LanguageKey[]).map(
                    (lang) => (
                      <Button
                        key={lang}
                        type="button"
                        variant={language === lang ? "default" : "ghost"}
                        onClick={() => setLanguage(lang)}
                      >
                        {LANGUAGES[lang].icon} {LANGUAGES[lang].name}
                      </Button>
                    )
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </form>
            {/* Messages */}
            <div className="space-y-4 max-h-[300px] overflow-auto">
              {messages.map((message, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div>
                    <ReactMarkdown className="prose prose-sm">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right Panel */}
          <div className="md:w-1/2 p-4 space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyToClipboard}>
                {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" onClick={downloadCode}>
                <Download className="mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={saveCode}>
                <Bookmark className="mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <FilePlus className="mr-2" />
                History
              </Button>
              <Button variant="outline" onClick={undoLastMessage}>
                <RotateCcw className="mr-2" />
                Undo
              </Button>
            </div>
            <div className="h-full border p-4 rounded-lg overflow-auto">
              {codeContent ? (
                <>
                  <div className="mb-4">
                    <ReactCodeMirror
                      value={codeContent}
                      extensions={
                        language === "javascript"
                          ? [javascript()]
                          : language === "typescript"
                          ? [javascript({ typescript: true })]
                          : [html()]
                      }
                      theme="dark"
                      readOnly
                      height="200px"
                    />
                  </div>
                  <div className="border-t pt-4">
                    <ReactLivePreview
                      code={codeContent}
                      language={language}
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Your generated code will appear here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Save Code Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="codeTitle">Title</Label>
              <Input
                id="codeTitle"
                value={codeTitle}
                onChange={(e) => setCodeTitle(e.target.value)}
                placeholder="Enter a title for your code"
              />
              <Button onClick={handleSaveCode}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Saved Codes History */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Saved Codes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {savedCodes.length > 0 ? (
                savedCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex justify-between items-center border-b pb-2 mb-2"
                  >
                    <div>
                      <h4 className="text-lg font-bold">{code.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(code.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => loadSavedCode(code)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteSavedCode(code.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No saved codes found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </ToolPage>
    </>
  );
};

export default CodePage;
