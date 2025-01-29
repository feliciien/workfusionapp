"use client";

import NavbarClient from "./navbar-client";
import Sidebar from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  apiLimits: { [key: string]: number };
  isPro: boolean;
}

export function DashboardShell({
  children,
  apiLimits,
  isPro
}: DashboardShellProps) {
  return (
    <div className='h-full relative dark:bg-gray-900'>
      <div className='hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900'>
        <div className='flex h-full flex-col'>
          <Sidebar apiLimits={apiLimits} isPro={isPro} />
        </div>
      </div>
      <main className='md:pl-72 dark:bg-gray-900'>
        <NavbarClient apiLimits={apiLimits} isPro={isPro} />
        {children}
      </main>
    </div>
  );
}
