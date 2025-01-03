import { auth } from "@/auth"
import { getServerSession } from "next-auth"

export async function getCurrentUser() {
  const session = await getServerSession(auth)
  return session?.user
}

export async function requireAuth() {
  const session = await getServerSession(auth)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}

export async function getUserId() {
  const session = await getServerSession(auth)
  return session?.user?.id
}
