/** @format */

"use client";

import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api-client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { tools } from "../dashboard/config";

const languages = [
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "russian", label: "Russian" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "chinese", label: "Chinese" },
  { value: "arabic", label: "Arabic" },
];

export default function TranslatePage() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tool = tools.find((t) => t.label === "Translation")!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.translate(text, targetLang);
      if (!response.data?.translation) {
        throw new Error("No translation received from the API");
      }
      setTranslation(response.data.translation);
      toast.success("Translation complete!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolPage tool={tool} isLoading={isLoading}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text to translate</label>
            <Textarea
              placeholder="Enter text to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-32"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Language</label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !text || !targetLang}
          >
            Translate
          </Button>
        </div>
        {translation && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Translation:</label>
            <div className="p-4 bg-secondary/50 rounded-lg">{translation}</div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(translation);
                toast.success("Copied to clipboard!");
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        )}
      </form>
    </ToolPage>
  );
}
