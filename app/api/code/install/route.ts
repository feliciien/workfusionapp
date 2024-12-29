import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectDir = body.projectDir as string;
    const dependencies = body.dependencies as Record<string, string>;
    const devDependencies = body.devDependencies as Record<string, string>;

    if (!projectDir) {
      throw new Error('Project directory is required');
    }

    // Ensure project directory exists
    await mkdir(projectDir, { recursive: true });

    const runCommand = (command: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const child = spawn(command, [], {
          shell: true,
          cwd: projectDir,
        });

        let output = '';

        child.stdout?.on('data', (data) => {
          output += data.toString();
          console.log(data.toString());
        });

        child.stderr?.on('data', (data) => {
          output += data.toString();
          console.error(data.toString());
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command failed with code ${code}\n${output}`));
          }
        });
      });
    };

    // Initialize npm project
    await runCommand('npm init -y');

    // Install production dependencies
    if (dependencies && Object.keys(dependencies).length > 0) {
      for (const [name, version] of Object.entries(dependencies)) {
        try {
          await runCommand(`npm install --save ${name}@${version}`);
          console.log(`Installed ${name}@${version}`);
        } catch (error) {
          console.error(`Failed to install ${name}@${version}:`, error);
        }
      }
    }

    // Install dev dependencies
    if (devDependencies && Object.keys(devDependencies).length > 0) {
      for (const [name, version] of Object.entries(devDependencies)) {
        try {
          await runCommand(`npm install --save-dev ${name}@${version}`);
          console.log(`Installed ${name}@${version}`);
        } catch (error) {
          console.error(`Failed to install ${name}@${version}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error installing dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to install dependencies', message: error.message },
      { status: 500 }
    );
  }
}
