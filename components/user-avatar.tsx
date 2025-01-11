import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Analytics } from "@vercel/analytics/react";

export const UserAvatar = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.image || undefined} />
      <AvatarFallback>
        {user?.name?.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
