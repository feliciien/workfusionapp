"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
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

const CodePage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [sandboxCode, setSandboxCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const userMessage: ChatCompletionRequestMessage = {
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
        <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">Code Generation</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            Start a conversation by entering a prompt below.
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <div
                className={cn(
                  "max-w-lg mx-2 p-4 rounded-lg shadow-md transition-all duration-300",
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                )}
              >
                <ReactMarkdown
                  className="prose prose-sm dark:prose-dark"
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto my-2 bg-black/10 p-2 rounded-lg">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <SyntaxHighlighter
                        language="javascript"
                        style={materialLight}
                        className="rounded-lg p-2"
                      >
                        {String(props.children)}
                      </SyntaxHighlighter>
                    ),
                  }}
                >
                  {message.content || ""}
                </ReactMarkdown>
                {/* Optional: Add timestamps here */}
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