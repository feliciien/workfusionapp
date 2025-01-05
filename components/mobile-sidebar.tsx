"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const MobileSidebar = ({
  apiLimitCount,
  isPro = false
}: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      </SheetContent>
    </Sheet>
  );
};
