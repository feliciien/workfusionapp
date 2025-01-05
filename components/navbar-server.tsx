import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { NavbarClient } from "./navbar-client";
import { getSessionFromRequest } from "@/lib/jwt";
import { headers } from "next/headers";

const Navbar = async () => {
  const headersList = headers();
  const session = await getSessionFromRequest(new Request("http://localhost", {
    headers: headersList,
  }));
  const userId = session?.id;

  const apiLimitCount = userId ? await getApiLimitCount(userId) : 0;
  const isPro = userId ? await checkSubscription(userId) : false;

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-gray-200 bg-white h-16">
      <div className="flex items-center">
        <NavbarClient apiLimitCount={apiLimitCount} isPro={isPro} />
      </div>
    </div>
  );
};

export default Navbar;
