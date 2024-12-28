"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

const MobileSidebar = ({
  apiLimits = {},
  isPro = false
}: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden pr-4">
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-gray-900">
        <Sidebar apiLimits={apiLimits} isPro={isPro} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
