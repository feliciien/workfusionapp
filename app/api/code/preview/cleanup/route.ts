import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

const PREVIEW_DIR = path.join(process.cwd(), 'preview-projects');

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { previewId } = body;

    if (!previewId) {
      return new NextResponse("Missing previewId", { status: 400 });
    }

    // Clean up the preview directory
    const projectDir = path.join(PREVIEW_DIR, previewId);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
      console.log('Cleaned up preview directory:', projectDir);
    } catch (error) {
      console.error('Error cleaning up preview directory:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

// Reference to previewServers from preview/route.ts
declare const previewServers: Map<string, {
  process: any;
  port: number;
  lastAccessed: number;
}>;
