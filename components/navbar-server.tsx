import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import NavbarClient from "./navbar-client";

const Navbar = async () => {
  const apiLimitData = await getApiLimitCount();
  const isPro = await checkSubscription();

  return <NavbarClient apiLimits={apiLimitData.limits || {}} isPro={isPro} />;
};

export default Navbar;
