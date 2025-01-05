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
    const { action, filePath, content } = body;

    if (!action || !filePath) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure the path is within the allowed directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith('/Users/MacBookPro/Desktop/generated-projects/')) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    switch (action) {
      case 'createDirectory':
        await fs.mkdir(normalizedPath, { recursive: true });
        return NextResponse.json({ success: true });

      case 'writeFile':
        if (content === undefined) {
          return new NextResponse("Missing content for writeFile", { status: 400 });
        }
        // Ensure the directory exists
        await fs.mkdir(path.dirname(normalizedPath), { recursive: true });
        await fs.writeFile(normalizedPath, content);
        return NextResponse.json({ success: true });

      default:
        return new NextResponse(`Invalid action: ${action}`, { status: 400 });
    }
  } catch (error) {
    console.error('Filesystem operation error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
