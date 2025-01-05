"use client";

import { MobileSidebar } from "./mobile-sidebar";
import { UserButton } from "./user-button";

interface NavbarClientProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const NavbarClient = ({
  apiLimitCount,
  isPro = false
}: NavbarClientProps) => {
  return (
    <div className="flex items-center gap-x-4">
      <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      <div className="flex w-full justify-end">
        <UserButton />
      </div>
    </div>
  );
};
