import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { directory } = body;

    if (!directory) {
      return new NextResponse("Directory is required", { status: 400 });
    }

    // Ensure the directory exists and is within the user's preview directory
    const previewDir = path.join(process.cwd(), 'public', 'previews', userId);
    const targetDir = path.join(previewDir, directory);

    try {
      await fs.access(targetDir);
      await fs.rm(targetDir, { recursive: true });
      return new NextResponse("Directory cleaned up", { status: 200 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return new NextResponse("Directory not found", { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[CLEANUP_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Reference to previewServers from preview/route.ts
declare const previewServers: Map<string, {
  process: any;
  port: number;
  lastAccessed: number;
}>;
