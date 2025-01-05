import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TerminalRequest {
  command: string;
  cwd?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json() as TerminalRequest;
    const { command, cwd } = body;

    if (!command) {
      return new NextResponse("Command is required", { status: 400 });
    }

    // Ensure the working directory is within the user's workspace
    const workspaceDir = path.join(process.cwd(), 'workspaces', userId);
    const workingDir = cwd ? path.join(workspaceDir, cwd) : workspaceDir;

    // Execute the command
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        env: {
          ...process.env,
          PATH: process.env.PATH
        },
        timeout: 30000 // 30 seconds timeout
      });

      return NextResponse.json({
        success: true,
        stdout,
        stderr
      });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }
      throw error;
    }
  } catch (error) {
    console.error("[TERMINAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
