import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center">
      <div className="w-10 h-10 relative animate-spin">
        <Loader2 className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        Loading your AI tools...
      </p>
    </div>
  );
}
