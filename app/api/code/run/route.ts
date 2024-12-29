import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: Request) {
  try {
    const { projectDir, command, args = [] } = await req.json();

    const process = spawn(command, args, {
      cwd: projectDir,
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
      output += data.toString();
      console.error(data.toString());
    });

    // For npm run dev, we don't wait for the process to finish
    if (command === 'npm' && args.includes('dev')) {
      return NextResponse.json({ success: true, message: 'Development server started' });
    }

    // For other commands, wait for completion
    await new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}\n${output}`));
        }
      });
    });

    return NextResponse.json({ success: true, output });
  } catch (error: any) {
    console.error('Error running command:', error);
    return NextResponse.json(
      { error: 'Failed to run command', message: error.message },
      { status: 500 }
    );
  }
}
