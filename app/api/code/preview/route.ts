import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { exec } from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PREVIEW_DIR = path.join(process.cwd(), 'preview-projects');

// Ensure the preview directory exists
try {
  if (!fsSync.existsSync(PREVIEW_DIR)) {
    fsSync.mkdirSync(PREVIEW_DIR, { recursive: true, mode: 0o755 });
  }
  console.log('Preview directory created/verified at:', PREVIEW_DIR);
} catch (error) {
  console.error('Error creating preview directory:', error);
}

export async function POST(req: Request) {
  console.log('Received preview request');
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log('Unauthorized request - no userId');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { files } = body;

    console.log('Received files:', files.map((f: any) => ({ path: f.path, contentLength: f.content?.length })));

    if (!files || !Array.isArray(files)) {
      console.log('Missing or invalid files array');
      return new NextResponse("Missing or invalid files array", { status: 400 });
    }

    // Create a unique directory for this preview
    const previewId = uuidv4();
    const projectDir = path.join(PREVIEW_DIR, previewId);
    console.log('Creating project directory:', projectDir);

    // Create project directory
    await fs.mkdir(projectDir, { recursive: true, mode: 0o755 });

    // Write all files
    for (const file of files) {
      try {
        // Normalize the file path to prevent directory traversal
        const normalizedPath = path.normalize(file.path).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(projectDir, normalizedPath);
        console.log('Writing file:', filePath);
        
        await fs.mkdir(path.dirname(filePath), { recursive: true, mode: 0o755 });
        await fs.writeFile(filePath, file.content, { mode: 0o644 });
      } catch (error) {
        console.error('Error writing file:', file.path, error);
        throw error;
      }
    }

    // Install dependencies and start the server
    const startPreview = () => {
      return new Promise((resolve, reject) => {
        try {
          // Create package.json if it doesn't exist
          const packageJsonPath = path.join(projectDir, 'package.json');
          console.log('Creating package.json at:', packageJsonPath);
          
          if (!fsSync.existsSync(packageJsonPath)) {
            const packageJson = {
              "name": "preview-project",
              "version": "0.1.0",
              "private": true,
              "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start"
              },
              "dependencies": {
                "next": "^14.0.4",
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
              }
            };
            
            fsSync.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), { mode: 0o644 });
          }

          // Install dependencies with more detailed error logging
          console.log('Installing dependencies in:', projectDir);
          const install = exec('npm install', { 
            cwd: projectDir,
            env: { 
              ...process.env, 
              FORCE_COLOR: "1",
              HOME: process.env.HOME,
              PATH: process.env.PATH,
              npm_config_cache: path.join(projectDir, '.npm-cache')
            }
          });
          
          let installOutput = '';
          install.stdout?.on('data', (data) => {
            installOutput += data;
            console.log('npm install stdout:', data);
          });
          
          install.stderr?.on('data', (data) => {
            installOutput += data;
            console.error('npm install stderr:', data);
          });

          install.on('error', (error) => {
            console.error('npm install error:', error);
            reject(error);
          });

          install.on('close', (code) => {
            if (code !== 0) {
              console.error('npm install failed with code:', code);
              console.error('Install output:', installOutput);
              reject(new Error(`npm install failed with code ${code}`));
              return;
            }

            console.log('Dependencies installed successfully');

            // Start the development server on a random port
            const port = 3001 + Math.floor(Math.random() * 1000);
            console.log('Starting preview server on port:', port);
            
            const server = exec(`PORT=${port} npm run dev`, { 
              cwd: projectDir,
              env: { 
                ...process.env, 
                FORCE_COLOR: "1",
                HOME: process.env.HOME,
                PATH: process.env.PATH,
                PORT: port.toString(),
                npm_config_cache: path.join(projectDir, '.npm-cache')
              }
            });
            
            // Store the server process for cleanup
            previewServers.set(previewId, {
              process: server,
              port,
              lastAccessed: Date.now()
            });

            let serverOutput = '';
            server.stdout?.on('data', (data) => {
              serverOutput += data;
              console.log('Server stdout:', data);
              if (serverOutput.includes('ready')) {
                resolve({ previewId, port });
              }
            });

            server.stderr?.on('data', (data) => {
              serverOutput += data;
              console.error('Server stderr:', data);
            });

            server.on('error', (err) => {
              console.error('Server error:', err);
              reject(err);
            });

            // Set a timeout in case the server never starts
            setTimeout(() => {
              console.error('Server output before timeout:', serverOutput);
              reject(new Error('Preview server failed to start'));
            }, 30000);
          });
        } catch (error) {
          console.error('Error in startPreview:', error);
          reject(error);
        }
      });
    };

    console.log('Starting preview server...');
    const result = await startPreview();
    console.log('Preview server started successfully:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Preview server error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

// Store running preview servers
const previewServers = new Map<string, {
  process: any;
  port: number;
  lastAccessed: number;
}>();

// Clean up old preview servers
setInterval(() => {
  const now = Date.now();
  Array.from(previewServers.entries()).forEach(([id, server]) => {
    if (now - server.lastAccessed > 30 * 60 * 1000) { // 30 minutes
      console.log('Cleaning up preview server:', id);
      server.process.kill();
      previewServers.delete(id);
      // Clean up the directory
      const projectDir = path.join(PREVIEW_DIR, id);
      if (fsSync.existsSync(projectDir)) {
        try {
          fsSync.rmSync(projectDir, { recursive: true });
          console.log('Cleaned up preview directory:', projectDir);
        } catch (error) {
          console.error('Error cleaning up preview directory:', error);
        }
      }
    }
  });
}, 5 * 60 * 1000); // Check every 5 minutes
