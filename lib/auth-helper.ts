import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  
  return {
    session,
    userId: session.user.id,
    user: session.user
  };
}
