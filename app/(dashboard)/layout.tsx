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

    const apiLimit = await db.userApiLimit.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    apiLimitCount = apiLimit?.count || 0;
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar isPro={subscription?.status === "active"} apiLimitCount={apiLimitCount} />
      </div>
      <main className="md:pl-72 pb-10">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
