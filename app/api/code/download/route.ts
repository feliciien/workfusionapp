import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import JSZip from 'jszip';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { files } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new NextResponse("Invalid files data", { status: 400 });
    }

    // Create a new zip file
    const zip = new JSZip();

    // Add all files to the zip
    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    // Generate the zip file
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9
      }
    });

    // Return the zip file
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="project.zip"'
      }
    });
  } catch (error) {
    console.error('Download generation error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
