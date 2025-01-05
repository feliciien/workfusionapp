import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export async function getSessionUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image
  };
}

// Add a new function for Edge API routes
export async function getSessionUserFromRequest(req: Request): Promise<SessionUser> {
  const session = await fetch(new URL('/api/auth/session', req.url).toString(), {
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  }).then(res => res.json());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image
  };
}
