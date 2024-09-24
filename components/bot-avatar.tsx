import { Avatar, AvatarImage } from "./ui/avatar";
import { Analytics } from "@vercel/analytics/react"
export const BotAvatar = () => {
	return (
		<Avatar className="h-8 w-8">
			<AvatarImage className="p-1" src="/logo.png" />
		</Avatar>
	);
};
