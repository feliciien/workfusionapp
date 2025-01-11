"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";

interface NavbarClientProps {
  apiLimits: {
    [key: string]: number;
  };
  isPro: boolean;
}

const NavbarClient = ({ apiLimits, isPro }: NavbarClientProps) => {
  const { data: session, status } = useSession();

  return (
    <div className="flex items-center p-4 relative z-50">
      <MobileSidebar apiLimits={apiLimits} isPro={isPro} />
      <div className="flex w-full justify-end">
        {status === "loading" ? null : session?.user ? (
          <div className="flex items-center space-x-4">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default NavbarClient;
