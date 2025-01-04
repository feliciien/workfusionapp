import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Analytics } from "@vercel/analytics/react"
import Image from 'next/image';

export const BotAvatar = () => {
	return (
		<Avatar className="h-8 w-8">
			<div className="relative h-8 w-8">
				<Image
					className="rounded-full"
					fill
					alt="Bot"
					src="/logo.png"
					sizes="(max-width: 32px) 100vw, 32px"
				/>
			</div>
		</Avatar>
	);
};
