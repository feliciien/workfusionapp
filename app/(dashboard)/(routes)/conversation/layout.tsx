"use client";

import { ConversationSidebar } from "@/components/conversation-sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <ConversationSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
