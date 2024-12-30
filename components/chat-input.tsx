"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSubmit?: () => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSubmit, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "0";
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(Math.max(56, scrollHeight), 200)}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      props.onInput?.(e);
    };

    return (
      <div className="relative">
        <Textarea
          ref={(element) => {
            // Handle both refs
            if (typeof ref === "function") {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
            textareaRef.current = element;
          }}
          className={cn(
            "resize-none overflow-y-hidden min-h-[56px] max-h-[200px] py-3 pr-12 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
            "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400",
            "transition-all duration-200",
            className
          )}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          {...props}
        />
        <div className="absolute right-3 bottom-3 text-sm text-gray-400">
          Press ⏎ to send
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };
