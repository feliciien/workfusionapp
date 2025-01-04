import Navbar from "@/components/navbar-server";
import Sidebar from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return redirect('/auth/signin');
    }

    // Fetch user's subscription and API limits
    const [subscription, apiLimit] = await Promise.all([
      prisma.userSubscription.findUnique({
        where: {
          userId: session.user.id
        }
      }),
      prisma.userApiLimit.findUnique({
        where: {
          userId: session.user.id
        },
        select: {
          count: true
        }
      })
    ]);

    const isPro = subscription?.paypalStatus === "ACTIVE";
    const apiLimits = { count: apiLimit?.count || 0 };

    return (
      <div className="h-full relative dark:bg-gray-900">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
          <div className="flex h-full flex-col">
            <Sidebar apiLimits={apiLimits} isPro={isPro} />
          </div>
        </div>
        <main className="md:pl-72 dark:bg-gray-900">
          <Navbar />
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error("[DASHBOARD_LAYOUT]", error);
    return redirect('/auth/signin');
  }
};

export default DashboardLayout;
