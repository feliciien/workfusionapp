import prismadb from "./prismadb";

export async function syncUser(userId: string) {
  if (!userId) {
    console.error("[USER_SYNC_ERROR] No userId provided");
    return false;
  }

  try {
    console.log("[USER_SYNC] Checking for user:", userId);
    
    // Check if user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      console.log("[USER_SYNC] User found:", userId);
      return true;
    }

    console.log("[USER_SYNC] Creating new user:", userId);
    
    // If user doesn't exist, create them
    await prismadb.user.create({
      data: {
        id: userId,
      },
    });

    console.log("[USER_SYNC] User created successfully:", userId);
    return true;
  } catch (error) {
    console.error("[USER_SYNC_ERROR] Details:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}
