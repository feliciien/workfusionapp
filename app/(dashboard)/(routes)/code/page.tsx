"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Moon, Sun, History, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import * as z from "zod";
import { Analytics } from "@vercel/analytics/react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import { atomOneLight, atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "react-hot-toast";

import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import useProModal from "@/hooks/use-pro-modal";
import { formSchema } from "./constants";

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);

// Model options and default values
const modelOptions = [
  { label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
  { label: "gpt-4", value: "gpt-4" },
];

// Common prompt templates
const promptTemplates = [
  "Generate a Next.js API route that fetches user data from a public API.",
  "Generate a Python function to sort a list of dictionaries by a key.",
  "Generate a Bash script to deploy a static site to AWS S3.",
  "Explain the Big-O complexity of binary search in a code snippet.",
  "Refactor this React component for better performance."
];

interface CodeMessage extends ChatCompletionRequestMessage {
  tokens?: number;
  cost?: number;
}

export default function CodePage() {
  const router = useRouter();
  const proModal = useProModal();

  const [messages, setMessages] = useState<CodeMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("codeSession");
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessages(parsed.messages || []);
      setModel(parsed.model || "gpt-3.5-turbo");
      setTemperature(parsed.temperature || 0.7);
      setLastUserPrompt(parsed.lastUserPrompt || "");
    }
    setSessionLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!sessionLoaded) return;
    const data = {
      messages,
      model,
      temperature,
      lastUserPrompt
    };
    localStorage.setItem("codeSession", JSON.stringify(data));
  }, [messages, model, temperature, lastUserPrompt, sessionLoaded]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle request submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const userMessage: CodeMessage = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];
      setLastUserPrompt(values.prompt);

      const response = await axios.post(
        "/api/code",
        {
          messages: newMessages,
          model,
          temperature,
        },
        { signal: controller.signal }
      );

      // Assume response.data includes { role: 'assistant', content: '...', tokens: number, cost: number }
      setMessages((current) => [...current, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      if (error?.name === "CanceledError") {
        toast("Generation stopped.");
      } else if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setAbortController(null);
      router.refresh();
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!lastUserPrompt) return;
    form.setValue("prompt", lastUserPrompt);
    await onSubmit({ prompt: lastUserPrompt });
  };

  // Stop generation
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    form.reset();
    setLastUserPrompt("");
    router.refresh();
  };

  // Explain code: Sends a follow-up prompt asking the model to explain the last snippet.
  const handleExplainCode = async () => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistantMsg) return toast("No assistant message to explain.");

    const explainPrompt = `Explain the above code in detail and highlight its functionality.`;
    form.setValue("prompt", explainPrompt);
    await onSubmit({ prompt: explainPrompt });
  };

  // Simple format code by prompting the AI
  const handleFormatCode = async () => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistantMsg) return toast("No code to format.");
    const formatPrompt = `Please format and clean up the above code according to best practices.`;
    form.setValue("prompt", formatPrompt);
    await onSubmit({ prompt: formatPrompt });
  };

  // Run code snippet if JavaScript (unsafe sandbox)
  const runCodeSnippet = (code: string) => {
    try {
      // WARNING: eval-like logic only for demo purposes
      const result = new Function(code)();
      toast.success(`Code executed successfully. Result: ${result}`);
    } catch (err: any) {
      toast.error(`Code execution error: ${err.message}`);
    }
  };

  // Shareable link (placeholder)
  const handleShareLink = () => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistantMsg) return toast("No message to share.");
    // Placeholder: In real scenario, generate a unique link (e.g. using a backend service)
    navigator.clipboard.writeText("https://example.com/shared/code-snippet")
      .then(() => toast.success("Shareable link copied!"))
      .catch(() => toast.error("Failed to copy link."));
  };

  // Download entire conversation as JSON
  const handleDownloadConversation = () => {
    const json = JSON.stringify(messages, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Code block rendering with copy, download, run & share placeholder
  const CodeBlock = ({ inline, className, children }: any) => {
    const codeRef = useRef<HTMLDivElement>(null);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "javascript";
    const codeText = String(children).trim();

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeText);
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy.");
      }
    };

    const handleDownloadCode = () => {
      const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code-snippet.${language}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (inline) {
      return (
        <code className="rounded-sm p-1 bg-black/10 dark:bg-black/20">
          {children}
        </code>
      );
    }

    return (
      <div className="relative group my-2">
        <div className="flex space-x-2 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownloadCode}>
            Download
          </Button>
          {language === "javascript" && (
            <Button variant="ghost" size="sm" onClick={() => runCodeSnippet(codeText)}>
              Run
            </Button>
          )}
        </div>
        <SyntaxHighlighter
          language={language}
          style={darkMode ? atomOneDark : atomOneLight}
          customStyle={{
            borderRadius: "0.5rem",
            padding: "1rem",
            marginTop: "2rem",
          }}
          ref={codeRef}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Extract prompt history (only user messages)
  const userPrompts = messages.filter(m => m.role === "user").map(m => m.content);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Prompt History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Prompt History</h2>
            {userPrompts.length === 0 ? (
              <div className="text-gray-700 dark:text-gray-300 text-sm">No prompts yet.</div>
            ) : (
              <ul className="max-h-64 overflow-y-auto space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {userPrompts.map((p, i) => (
                  <li key={i} className="border-b border-gray-200 dark:border-gray-800 pb-1">
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowHistory(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 flex items-center justify-between w-full">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          SynthAI Code
        </div>
        <div className="flex items-center space-x-4">
          {/* Model Selection */}
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded p-1"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
          >
            {modelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Temperature Control */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300 text-sm">Temp:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              disabled={isLoading}
            />
            <span className="text-gray-700 dark:text-gray-300 text-sm">{temperature.toFixed(1)}</span>
          </div>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* History Modal Toggle */}
          <Button variant="outline" onClick={() => setShowHistory(true)} disabled={isLoading}>
            <History className="h-4 w-4 mr-1 inline-block" /> History
          </Button>

          {/* Clear Conversation */}
          <Button variant="outline" onClick={handleClearConversation} disabled={isLoading}>
            Clear
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-4 lg:p-8">
          <Heading
            title="Code Generation"
            description="Leverage advanced AI to generate and refine code snippets."
            icon={Code}
            iconColor="text-green-700"
            bgColor="bg-green-700/10"
          />

          {/* Prompt Templates */}
          <div className="mb-4 flex flex-wrap gap-2">
            {promptTemplates.map((tmpl, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => {
                  form.setValue("prompt", tmpl);
                }}
              >
                {tmpl.length > 50 ? tmpl.substring(0, 47) + "..." : tmpl}
              </Button>
            ))}
          </div>

          <div className="my-4 space-y-4">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Loader />
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <Empty label="Start typing or select a prompt template to generate code." />
            )}

            <div className="flex flex-col gap-y-4">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-full flex items-start gap-x-4 rounded-lg p-4",
                      isUser
                        ? "bg-white dark:bg-gray-950 border border-black/10 dark:border-gray-800"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {isUser ? <UserAvatar /> : <BotAvatar />}
                    <ReactMarkdown
                      className="text-sm text-gray-900 dark:text-gray-100 leading-7 w-full"
                      components={{
                        code: CodeBlock,
                        pre: ({ node, ...props }) => <div {...props} />,
                      }}
                    >
                      {message.content || ""}
                    </ReactMarkdown>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions (only show if there's at least one message) */}
      {messages.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full flex flex-wrap gap-2 justify-center">
          <Button variant="outline" onClick={handleExplainCode} disabled={isLoading || messages.length === 0}>
            Explain Code
          </Button>
          <Button variant="outline" onClick={handleFormatCode} disabled={isLoading || messages.length === 0}>
            Format Code
          </Button>
          <Button variant="outline" onClick={handleShareLink} disabled={isLoading || messages.length === 0}>
            <Link className="h-4 w-4 mr-1 inline-block" />
            Share Link
          </Button>
          <Button variant="outline" onClick={handleDownloadConversation} disabled={isLoading || messages.length === 0}>
            Download Conversation
          </Button>
        </div>
      )}

      {/* Prompt Input (Fixed at Bottom) */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 fixed bottom-0 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2 max-w-3xl mx-auto">
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl className="m-0 p-0">
                    <Input
                      {...field}
                      placeholder="Ask for code, or choose a template above."
                      className="border-gray-300 dark:border-gray-700 focus-visible:ring-0 focus-visible:ring-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isLoading && lastUserPrompt && (
              <Button variant="outline" type="button" onClick={handleRegenerate}>
                Regenerate
              </Button>
            )}
            {isLoading && (
              <Button variant="outline" type="button" onClick={handleStop}>
                Stop
              </Button>
            )}
            <Button className="w-auto" disabled={isLoading}>
              Generate
            </Button>
          </form>
        </Form>
      </div>
      <Analytics />
    </div>
  );
}