import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Subscription } from "@prisma/client";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DashboardLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user subscription and API limit count
  let subscription: Subscription | null = null;
  let apiLimitCount = 0;

  if (session?.user?.id) {
    subscription = await db.subscription.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    apiLimitCount = await db.apiLimit.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });
  }

  return (
    <div className="h-full relative dark:bg-gray-900">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <div className="flex h-full flex-col">
          <Sidebar isPro={!!subscription?.isPro} apiLimitCount={apiLimitCount} />
        </div>
      </div>
      <main className="md:pl-72 pb-10 dark:bg-gray-900">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
