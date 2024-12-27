import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Analytics } from "@vercel/analytics/react"

export const BotAvatar = () => {
	return (
		<Avatar className="h-8 w-8">
			<AvatarImage 
				className="p-1" 
				src="/logo.png"
				sizes="(max-width: 32px) 100vw, 32px"
				alt="AI Assistant Avatar"
			/>
		</Avatar>
	);
};
