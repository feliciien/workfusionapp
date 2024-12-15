import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import NavbarClient from "./navbar-client";

const Navbar = async () => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return <NavbarClient apiLimitCount={apiLimitCount} isPro={isPro} />;
};

export default Navbar;
