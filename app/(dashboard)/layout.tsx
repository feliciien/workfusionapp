import Navbar from "@/components/navbar-server";
import Sidebar from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Disable caching for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await getServerSession(auth);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="h-full relative dark:bg-gray-900">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex h-full flex-col">
          <Sidebar />
        </div>
      </div>
      <main className="md:pl-72 dark:bg-gray-900">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
