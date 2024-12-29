import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { exec } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { command, cwd } = body;

    if (!command || !cwd) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate working directory
    const normalizedPath = path.normalize(cwd);
    if (!normalizedPath.startsWith('/Users/MacBookPro/Desktop/generated-projects/')) {
      return new NextResponse("Invalid working directory", { status: 400 });
    }

    // Execute command
    const executeCommand = () => {
      return new Promise((resolve, reject) => {
        const process = exec(command, { cwd: normalizedPath });

        let output = '';
        let error = '';

        process.stdout?.on('data', (data) => {
          output += data;
        });

        process.stderr?.on('data', (data) => {
          error += data;
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve({ output, error });
          } else {
            reject(new Error(error || `Command failed with code ${code}`));
          }
        });

        process.on('error', (err) => {
          reject(err);
        });
      });
    };

    const result = await executeCommand();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Terminal command error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
