import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { getAuthSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }
  
  // Force revalidation by including current timestamp
  const headersList = headers();
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
    <DashboardShell apiLimits={apiLimitData.limits || {}} isPro={isPro}>
      {children}
    </DashboardShell>
  );
}
