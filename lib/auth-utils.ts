import { getSessionFromRequest } from "@/lib/jwt"
import { headers } from "next/headers"

export async function getCurrentUser() {
  const headersList = headers();
  const session = await getSessionFromRequest(new Request("http://localhost", {
    headers: headersList,
  }));
  return session;
}

export async function requireAuth() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getUserId() {
  const session = await getCurrentUser();
  return session?.id;
}
