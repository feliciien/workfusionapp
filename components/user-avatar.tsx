"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Analytics } from "@vercel/analytics/react"

export const UserAvatar = () => {
  const { data: session } = useSession();

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={session?.user?.image || ""} />
      <AvatarFallback>
        {session?.user?.name?.[0]?.toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
};
