"use client";

import MobileSidebar from "./mobile-sidebar";
import { UserButton } from "./user-button";

interface NavbarClientProps {
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

const NavbarClient = ({ apiLimits, isPro }: NavbarClientProps) => {
  return (
    <div className="flex items-center p-4 relative z-50">
      <MobileSidebar apiLimits={apiLimits} isPro={isPro} />
      <div className="flex w-full justify-end">
        <UserButton />
      </div>
    </div>
  );
};

export default NavbarClient;
