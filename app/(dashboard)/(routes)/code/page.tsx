"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Moon, Sun } from "lucide-react";
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
import { toast } from "react-hot-toast";
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

const CodePage = () => {
  const router = useRouter();
  const proModal = useProModal();

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(0.7);
  const [lastUserPrompt, setLastUserPrompt] = useState("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Handle request submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const userMessage: ChatCompletionRequestMessage = {
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Code block rendering with copy and download
  const CodeBlock = ({ inline, className, children }: any) => {
    const codeRef = useRef<HTMLDivElement>(null);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "javascript";

    const handleCopy = async () => {
      const codeText = String(children).trim();
      try {
        await navigator.clipboard.writeText(codeText);
        toast.success("Copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy.");
      }
    };

    const handleDownload = () => {
      const codeText = String(children).trim();
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
        <div className="flex space-x-2 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            Download
          </Button>
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
          {String(children).trim()}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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

          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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

          <div className="my-4 space-y-4">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Loader />
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <Empty label="Start typing to generate code." />
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
                      placeholder="Ask for code, e.g. 'Generate a Python function that reverses a list.'"
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
};

export default CodePage;