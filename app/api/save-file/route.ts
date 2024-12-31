import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { path: filePath, content } = body;

    if (!filePath || content === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure the path is absolute and within the project directory
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    // Create directories if they don't exist
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    // Write the file
    await fs.writeFile(absolutePath, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SAVE_FILE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
