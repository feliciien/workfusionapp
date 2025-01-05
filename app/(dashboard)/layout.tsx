import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getSessionFromRequest } from "@/lib/jwt";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Subscription } from "@prisma/client";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DashboardLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  const headersList = headers();
  const session = await getSessionFromRequest(new Request("http://localhost", {
    headers: headersList,
  }));

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user subscription and API limit count
  let subscription: Subscription | null = null;
  let apiLimitCount = 0;

  if (session?.id) {
    try {
      const [subscriptionData, featureUsage] = await Promise.all([
        db.subscription.findUnique({
          where: {
            userId: session.id
          }
        }),
        db.userFeatureUsage.findUnique({
          where: {
            userId_featureType: {
              userId: session.id,
              featureType: 'API_USAGE'
            }
          }
        })
      ]);

      subscription = subscriptionData;
      apiLimitCount = featureUsage?.count || 0;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return (
    <div className="h-full relative dark:bg-gray-900">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <div className="flex h-full flex-col">
          <Sidebar 
            apiLimitCount={apiLimitCount} 
            isPro={subscription?.status === "active"} 
          />
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
