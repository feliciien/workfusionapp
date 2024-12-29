import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import fs from 'fs-extra';
import path from 'path';
import { join, dirname } from 'path';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    let { path: filePath, content, isDirectory } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to use this feature' },
        { status: 401 }
      );
    }

    // Clean up the path and make it absolute
    filePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const projectDir = '/Users/MacBookPro/Desktop/SynthAI-1/tmp/projects';
    const absolutePath = join(projectDir, filePath);

    try {
      if (isDirectory) {
        await fs.mkdir(absolutePath, { recursive: true });
        console.log(`Created directory: ${absolutePath}`);
      } else {
        // Ensure parent directory exists
        await fs.mkdir(dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, content || '');
        console.log(`Created file: ${absolutePath}`);
      }

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error(`Failed to create ${isDirectory ? 'directory' : 'file'} at ${absolutePath}:`, error);
      return NextResponse.json(
        { 
          error: 'File System Error',
          message: error.message,
          path: absolutePath
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}
