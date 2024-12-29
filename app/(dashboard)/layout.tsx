import NavbarWrapper from "@/components/navbar-wrapper";
import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Force revalidation by including current timestamp
  const headersList = await headers();
  const referer = headersList.get("referer");
  const path = headersList.get("x-pathname");
  
  const apiLimitData = await getApiLimitCount();
  const isPro = await checkSubscription();

  console.log("[DASHBOARD_LAYOUT] User status:", {
    userId,
    isPro,
    apiLimitData,
    path,
    referer,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="h-full relative dark:bg-gray-900">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex h-full flex-col">
          <Sidebar apiLimits={apiLimitData.limits || {}} isPro={isPro} />
        </div>
      </div>
      <main className="md:pl-72 dark:bg-gray-900">
        <NavbarWrapper />
        {children}
      </main>
    </div>
  );
}
