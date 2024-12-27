"use client";

import axios from "axios";
import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import useProModal from "@/hooks/use-pro-modal";
import { cn } from "@/lib/utils";
import { Check, Code, ImageIcon, MessageSquare, Music, VideoIcon, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { LayoutDashboard, Network, History, Mic2, Palette, Brain, FileText, PresentationIcon, Lightbulb } from "lucide-react";

export const ProModal = () => {
  const proModal = useProModal();
  const [loading, setLoading] = useState(false);

  const tools = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      free: true
    },
    {
      label: "Network Monitor",
      icon: Network,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      free: true
    },
    {
      label: "Conversation",
      icon: MessageSquare,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      free: true
    },
    {
      label: "History",
      icon: History,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      free: true
    },
    {
      label: "Image Generation",
      icon: ImageIcon,
      color: "text-pink-700",
      bgColor: "bg-pink-700/10",
      free: true,
      limit: "Limited to 25 generations"
    },
    {
      label: "Video Creation",
      icon: VideoIcon,
      color: "text-orange-700",
      bgColor: "bg-orange-700/10",
      free: false
    },
    {
      label: "Code Generation",
      icon: Code,
      color: "text-green-700",
      bgColor: "bg-green-700/10",
      free: true,
      limit: "Basic templates only"
    },
    {
      label: "Music Synthesis",
      icon: Music,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      free: false
    },
    {
      label: "Voice Synthesis",
      icon: Mic2,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      free: true,
      limit: "Basic voices only"
    },
    {
      label: "Art Generation",
      icon: Palette,
      color: "text-purple-700",
      bgColor: "bg-purple-700/10",
      free: true,
      limit: "Basic styles only"
    },
    {
      label: "Custom Models",
      icon: Brain,
      color: "text-blue-700",
      bgColor: "bg-blue-700/10",
      free: false
    },
    {
      label: "Content Writer",
      icon: FileText,
      color: "text-gray-700",
      bgColor: "bg-gray-700/10",
      free: true,
      limit: "Up to 500 words"
    },
    {
      label: "Presentation Creator",
      icon: PresentationIcon,
      color: "text-red-700",
      bgColor: "bg-red-700/10",
      free: true,
      limit: "Basic templates only"
    },
    {
      label: "Idea Generator",
      icon: Lightbulb,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      free: true,
      limit: "5 ideas per request"
    }
  ];

  const onSubscribe = () => {
    try {
      setLoading(true);
      proModal.onClose();
      window.location.href = "/settings";
    } catch (error) {
      console.log("Error redirecting to settings:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center flex-col items-center pb-2 gap-y-4">
            <div className="flex items-center gap-x-2 font-bold py-1">
              Upgrade to WorkFusionApp Pro
              <Badge variant="premium" className="uppercase text-sm py-1">
                pro
              </Badge>
            </div>
          </DialogTitle>
          <div className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            {tools.map((tool) => (
              <Card key={tool.label} className="p-3 border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 flex w-fit rounded-md", tool.bgColor)}>
                    <tool.icon className={cn("h-6 w-6", tool.color)} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{tool.label}</div>
                    {tool.free && tool.limit && (
                      <div className="text-xs text-muted-foreground">{tool.limit}</div>
                    )}
                  </div>
                  {tool.free && <Badge variant="outline" className="ml-2">Free</Badge>}
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={loading} size="lg" variant="premium" className="w-full" onClick={onSubscribe}>
            Upgrade <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;