"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Code } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import * as z from "zod";
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
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [sandboxCode, setSandboxCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      const response = await axios.post("/api/code", {
        messages: newMessages,
      });
      setMessages((current) => [...current, userMessage, response.data]);
      setSandboxCode(response.data.content || "");
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  const runCodeInSandbox = () => {
    if (iframeRef.current) {
      const iframeDocument = iframeRef.current.contentDocument;
      const iframeWindow = iframeRef.current.contentWindow;

      if (iframeDocument && iframeWindow) {
        iframeDocument.open();
        iframeDocument.write(sandboxCode);
        iframeDocument.close();
      }
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = (code: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Heading
        title="Code Generation"
        description="Our most advanced AI Code Generation model."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        {...field}
                        placeholder="Enter your code prompt here"
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && <Empty label="Start typing to have a conversation." />}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown
                  className="text-sm overflow-hidden leading-7 w-full"
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
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
                {message.role !== "user" && (
                  <div className="flex flex-col items-start gap-2">
                    <Button size="sm" onClick={() => copyToClipboard(message.content || "")}>
                      Copy Code
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadCode(message.content || "")}>
                      Download
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-bold">Sandbox Preview</h2>
          <textarea
            className="w-full h-40 bg-gray-100 rounded-lg p-4 mt-2"
            value={sandboxCode}
            onChange={(e) => setSandboxCode(e.target.value)}
          />
          <Button className="mt-4" onClick={runCodeInSandbox}>
            Run Code
          </Button>
          <iframe
            ref={iframeRef}
            className="w-full h-96 mt-4 border rounded-lg bg-white"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            title="Code Execution Sandbox"
          />
        </div>
      </div>
    </div>
  );
};

export default CodePage;