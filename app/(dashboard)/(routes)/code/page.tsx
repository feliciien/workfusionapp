"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as path from 'path';
import {
  Code,
  FileCode2,
  Terminal,
  Save,
  Play,
  Coffee,
  MessageSquare,
  Square,
  Circle,
  Loader2,
  Wand2,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Download
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  files?: string[];
}

interface PackageJson {
  name: string;
  version: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

interface FileStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileStructure[];
  size?: number;
  expanded?: boolean;
}

interface ProjectConfig {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  setupCommands: {
    command: string;
    description: string;
  }[];
}

interface Project {
  name: string;
  description: string;
  type: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  setupCommands: Array<{ command: string; description: string; }>;
  command: string;
}

interface GeneratedFile {
  path: string;
  content: string;
  type?: 'file' | 'directory';
}

interface ProjectStatus {
  installing: boolean;
  running: boolean;
  error: string | null;
}

interface ProjectMetrics {
  fileCount: number;
  totalSize: number;
  lastModified: Date | null;
  testCoverage: number;
}

const LANGUAGE_EXTENSIONS = {
  'typescript': ['ts', 'tsx'],
  'javascript': ['js', 'jsx'],
  'html': ['html'],
  'css': ['css'],
  'json': ['json'],
  'markdown': ['md']
};

const getFileLanguage = (fileName: string) => {
  const extension = fileName.split('.').pop() || '';
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      return language;
    }
  }
  return 'plaintext';
};

// Helper function for rendering file tree
const renderFileTree = (
  items: FileStructure[],
  activeFile: FileStructure | null,
  setActiveFile: (file: FileStructure) => void,
  toggleDirectory: (path: string) => void
): React.ReactNode => {
  return items.map((item, index) => {
    const isActive = activeFile?.path === item.path;
    const isDirectory = item.type === 'directory';
    const isExpanded = item.expanded;

    return (
      <div key={`${item.path}-${index}`} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-800",
            isActive && "bg-gray-800"
          )}
          onClick={() => {
            if (isDirectory) {
              toggleDirectory(item.path);
            } else {
              setActiveFile(item);
            }
          }}
        >
          <div className="flex items-center flex-1 overflow-hidden">
            {isDirectory ? (
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <FolderOpen className="h-4 w-4 mr-2" />
              </div>
            ) : (
              <FileCode2 className="h-4 w-4 mr-2" />
            )}
            <span className="text-sm truncate">{item.name}</span>
          </div>
        </div>
        {isDirectory && isExpanded && item.children && (
          <div className="pl-4">
            {renderFileTree(item.children, activeFile, setActiveFile, toggleDirectory)}
          </div>
        )}
      </div>
    );
  });
};

const FileTreeItem: React.FC<{
  item: FileStructure;
  onSelect: (file: FileStructure) => void;
  onToggle: (path: string) => void;
  level: number;
}> = ({ item, onSelect, onToggle, level }) => {
  const isActive = item.path === item.path;
  
  return (
    <div style={{ marginLeft: `${level * 12}px` }}>
      <div
        className={cn(
          "flex items-center space-x-2 rounded px-2 py-1 cursor-pointer text-sm group hover:bg-gray-800",
          isActive && "bg-blue-500/20"
        )}
        onClick={() => item.type === 'file' ? onSelect(item) : onToggle(item.path)}
      >
        <div className="flex items-center">
          {item.type === 'directory' && (
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                item.expanded && "rotate-90"
              )}
            />
          )}
          {item.type === 'file' ? (
            <FileCode2 className="h-4 w-4 text-gray-400" />
          ) : (
            <FolderOpen className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <span className={cn(
          "text-sm",
          item.type === 'file' ? 'text-gray-300' : 'text-gray-200 font-medium'
        )}>
          {item.name}
        </span>
      </div>
      
      {item.type === 'directory' && item.expanded && item.children && (
        <div className="mt-1">
          {item.children.map((child, index) => (
            <FileTreeItem
              key={child.path + index}
              item={child}
              onSelect={onSelect}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Editor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

const PanelGroup = dynamic(
  () => import('react-resizable-panels').then(mod => mod.PanelGroup),
  { ssr: false }
);

const Panel = dynamic(
  () => import('react-resizable-panels').then(mod => mod.Panel),
  { ssr: false }
);

const PanelResizeHandle = dynamic(
  () => import('react-resizable-panels').then((mod) => mod.PanelResizeHandle),
  { ssr: false }
);

export default function CodePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<FileStructure | null>(null);
  const [editorTheme] = useState('vs-dark');
  const [isTerminalVisible] = useState(true);
  const [projectPath, setProjectPath] = useState<string>('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>({
    installing: false,
    running: false,
    error: null
  });
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>({
    fileCount: 0,
    totalSize: 0,
    lastModified: null,
    testCoverage: 0
  });
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addTerminalOutput = useCallback((message: string) => {
    setTerminalOutput(prev => [...prev, message]);
  }, []);

  const convertToFileStructure = useCallback((files: any[]): FileStructure[] => {
    const structure: Record<string, FileStructure> = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';
      
      parts.forEach((part: string, index: number) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!structure[currentPath]) {
          const isFile = index === parts.length - 1;
          structure[currentPath] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'directory',
            content: isFile ? file.content : undefined,
            children: isFile ? undefined : [],
            expanded: true
          };
          
          if (parentPath) {
            structure[parentPath].children = structure[parentPath].children || [];
            structure[parentPath].children.push(structure[currentPath]);
          }
        }
      });
    });
    
    return Object.values(structure).filter(item => !item.path.includes('/'));
  }, []);

  const createDownloadableProject = useCallback(async (project: Project) => {
    if (!project || !project.files) {
      toast.error('No project to create');
      return;
    }

    try {
      addTerminalOutput('\n📦 Preparing project for download...');

      // Create package.json
      const packageJson = {
        name: project.name,
        version: "0.1.0",
        private: true,
        scripts: project.scripts,
        dependencies: project.dependencies,
        devDependencies: project.devDependencies
      };

      // Add package.json to the files
      project.files.push({
        path: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
        type: 'file'
      });

      // Add README.md with setup instructions
      const readmeContent = `# ${project.name}

${project.description}

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`;

      project.files.push({
        path: 'README.md',
        content: readmeContent,
        type: 'file'
      });

      // Create a zip file containing all project files
      const response = await axios.post('/api/code/download', {
        files: project.files
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addTerminalOutput('✅ Project ready for download!');
      toast.success('Project downloaded successfully!');
    } catch (error) {
      console.error('Error preparing project for download:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to prepare project for download';
      toast.error(errorMessage);
      addTerminalOutput(`❌ Error: ${errorMessage}`);
    }
  }, [addTerminalOutput]);

  const handlePromptSubmit = useCallback(async () => {
    if (!prompt.trim() || isProcessing) {
      toast.error('Please enter a project description');
      return;
    }

    setIsProcessing(true);
    try {
      addTerminalOutput('\n🔨 Starting project generation...');
      
      const response = await axios.post('/api/code/generate', {
        prompt,
        context: messages.slice(-5)
      });

      const { files, dependencies } = response.data;
      
      if (!files || !Array.isArray(files)) {
        throw new Error('Invalid response format: missing files array');
      }

      addTerminalOutput('✓ Code generation completed');
      addTerminalOutput(`Generated ${files.length} files`);

      const fileStructure = convertToFileStructure(files);
      setFileStructure(fileStructure);
      
      // Set the first file as active
      const firstFile = files.find(f => f.type === 'file');
      if (firstFile) {
        setActiveFile({
          name: firstFile.path.split('/').pop() || '',
          path: firstFile.path,
          type: 'file',
          content: firstFile.content
        });
      }

      const project = {
        name: response.data.name || 'generated-project',
        description: prompt,
        type: 'next',
        files,
        dependencies: dependencies?.production || {},
        devDependencies: dependencies?.development || {},
        scripts: {
          "dev": "next dev",
          "build": "next build",
          "start": "next start"
        },
        setupCommands: [
          {
            command: "npm install",
            description: "Install dependencies"
          }
        ],
        command: "npm run dev"
      };

      setCurrentProject(project);
      toast.success('Project generated successfully!');
      
      // Create downloadable project
      await createDownloadableProject(project);
    } catch (error: any) {
      console.error('Project generation error:', error);
      toast.error(error.message || 'Failed to generate project');
      addTerminalOutput('❌ Error: ' + (error.message || 'Failed to generate project'));
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, isProcessing, messages, addTerminalOutput, convertToFileStructure, createDownloadableProject]);

  const updateProjectMetrics = useCallback(() => {
    if (!currentProject) return;

    const fileCount = currentProject.files.length;
    const totalSize = currentProject.files.reduce((acc, file) => acc + file.content.length, 0);
    const lastModified = new Date();

    setProjectMetrics({
      fileCount,
      totalSize,
      lastModified,
      testCoverage: 0
    });
  }, [currentProject]);

  useEffect(() => {
    updateProjectMetrics();
  }, [currentProject, updateProjectMetrics]);

  const buildFileTree = useCallback((files: GeneratedFile[] = []): FileStructure[] => {
    const root: FileStructure[] = [];
    const map: Record<string, FileStructure> = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';

      parts.forEach((part: string, index: number) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!map[currentPath]) {
          const node: FileStructure = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'directory',
            content: isLast ? file.content : undefined,
            children: isLast ? undefined : [],
            expanded: true
          };

          map[currentPath] = node;

          if (index === 0) {
            root.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = map[parentPath];
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }
      });
    });

    return root;
  }, []);

  const findFirstFile = useCallback((items: FileStructure[]): FileStructure | null => {
    for (const item of items) {
      if (item.type === 'file') return item;
      if (item.children) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const handleFileChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      const updatedFile = { ...activeFile, content: value };
      setActiveFile(updatedFile);
      
      // Update file in the tree
      setFileStructure(prev => {
        const updateFileInTree = (items: FileStructure[]): FileStructure[] => {
          return items.map(item => {
            if (item.path === activeFile.path) {
              return updatedFile;
            }
            if (item.children) {
              return {
                ...item,
                children: updateFileInTree(item.children)
              };
            }
            return item;
          });
        };
        return updateFileInTree(prev);
      });
    }
  }, [activeFile]);

  const toggleDirectory = useCallback((path: string) => {
    setFileStructure(prev => {
      const toggleNode = (items: FileStructure[]): FileStructure[] => {
        return items.map(item => {
          if (item.path === path) {
            return { ...item, expanded: !item.expanded };
          }
          if (item.children) {
            return {
              ...item,
              children: toggleNode(item.children)
            };
          }
          return item;
        });
      };
      return toggleNode(prev);
    });
  }, []);

  const saveFile = useCallback(() => {
    if (activeFile) {
      toast.success(`Saved ${activeFile.path}`);
    }
  }, [activeFile]);

  const runProject = useCallback(async () => {
    setIsProcessing(true);
    addTerminalOutput('\n🚀 Starting development server...');
    try {
      toast.success('Project started successfully!');
    } catch (error) {
      console.error('Error running project:', error);
      toast.error('Failed to start project');
      addTerminalOutput('❌ Error starting project');
    } finally {
      setIsProcessing(false);
    }
  }, [addTerminalOutput]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-gradient-to-b from-[#1a1a1a] to-[#1E1E1E]">
      {/* Header with glass effect */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#252526]/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <FileCode2 className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">Code Editor</h1>
          </div>
          <div className="h-6 w-px bg-gray-800/50" />
          <div className="flex-1 max-w-3xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              handlePromptSubmit();
            }} className="flex items-center space-x-3">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  placeholder="Describe what you want to build... (e.g., 'Create a restaurant menu component')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1E1E1E]/50 border border-gray-700/50 rounded-xl text-gray-200 
                           placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 
                           text-sm transition-all duration-200 shadow-lg"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 
                         text-white px-6 py-2 h-[38px] rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200
                         hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isProcessing || !prompt.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm font-medium">Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Generate</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={saveFile}
            className="text-gray-400 hover:text-white hover:bg-white/5 border-0"
            disabled={!activeFile}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span className="text-sm">Save</span>
          </Button>
          <div className="w-px h-4 bg-gray-800/50" />
          <Button
            variant="ghost"
            size="sm"
            onClick={runProject}
            className="text-gray-400 hover:text-white hover:bg-white/5 border-0"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1.5" />
            )}
            <span className="text-sm">Run</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <div className="h-full relative">
          <ResizablePanelGroup direction="horizontal">
            {/* File Explorer Panel */}
            <ResizablePanel defaultSize={15} minSize={10}>
              <div className="h-full flex flex-col bg-[#1E1E1E]/50 backdrop-blur-sm border-r border-gray-800/50">
                <div className="px-3 py-2 border-b border-gray-800/50 flex items-center justify-between">
                  <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Files</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewProjectDialog(true)}
                    className="h-6 w-6 p-0 rounded-lg hover:bg-white/5"
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {renderFileTree(fileStructure, activeFile, setActiveFile, toggleDirectory)}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[2px] bg-gradient-to-b from-gray-800/50 to-gray-800/30 hover:bg-indigo-500/50 transition-colors" />

            {/* Editor Panel */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <div className="h-full flex flex-col bg-[#1E1E1E]">
                {activeFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526]/80 backdrop-blur-sm border-b border-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm text-gray-300 font-medium">{activeFile.path}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Editor
                        className="h-full"
                        defaultLanguage={getFileLanguage(activeFile.path)}
                        value={activeFile.content}
                        onChange={handleFileChange}
                        theme="vs-dark"
                        options={{
                          fontSize: 14,
                          fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                          minimap: { enabled: true },
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                          cursorSmoothCaretAnimation: "on",
                          cursorBlinking: "blink",
                          lineNumbers: "on",
                          renderWhitespace: "selection",
                          padding: { top: 16, bottom: 16 },
                          folding: true,
                          automaticLayout: true,
                          formatOnPaste: true,
                          formatOnType: true,
                          suggestOnTriggerCharacters: true,
                          tabSize: 2,
                          glyphMargin: true,
                          renderLineHighlight: "all",
                          bracketPairColorization: {
                            enabled: true,
                          },
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center bg-[#1E1E1E]">
                    <div className="text-center space-y-4 max-w-md px-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-gray-800/30 to-gray-800/10 backdrop-blur-sm">
                        <FileCode2 className="h-12 w-12 text-indigo-400/50 mx-auto" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300 font-medium">No file selected</p>
                        <p className="text-gray-500 text-sm">Enter a prompt above to generate code or select a file from the explorer</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[2px] bg-gradient-to-b from-gray-800/50 to-gray-800/30 hover:bg-indigo-500/50 transition-colors" />

            {/* Terminal Panel */}
            <ResizablePanel defaultSize={15} minSize={10}>
              <div className="h-full flex flex-col bg-[#1E1E1E]/80 backdrop-blur-sm">
                <div className="px-4 py-2 bg-[#252526]/80 backdrop-blur-sm border-b border-gray-800/50 flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-300">Terminal</span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 font-mono text-xs space-y-1.5">
                    {terminalOutput.map((line, index) => (
                      <div key={index} className="text-gray-300/90">
                        {line}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[2px] bg-gradient-to-b from-gray-800/50 to-gray-800/30 hover:bg-indigo-500/50 transition-colors" />

            {/* Project Information Panel */}
            <ResizablePanel defaultSize={15} minSize={10}>
              <div className="h-full flex flex-col bg-[#1E1E1E]/80 backdrop-blur-sm">
                <div className="px-4 py-2 bg-[#252526]/80 backdrop-blur-sm border-b border-gray-800/50 flex items-center space-x-2">
                  <Coffee className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-300">Project</span>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      className="w-full resize-none rounded-md bg-[#1E1E1E] border border-gray-800/50 p-2 text-sm text-gray-300 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                      placeholder="Describe your project..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handlePromptSubmit}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                    {currentProject && (
                      <Button
                        onClick={() => createDownloadableProject(currentProject)}
                        variant="outline"
                        className="w-full border-gray-800/50 text-gray-300 hover:bg-white/5"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Project
                      </Button>
                    )}
                  </div>
                  {currentProject && (
                    <div className="rounded-md bg-[#252526] border border-gray-800/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{currentProject.name}</span>
                        <span className="text-xs text-gray-500">{currentProject.files.length} files</span>
                      </div>
                      <p className="text-xs text-gray-400">{currentProject.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="sm:max-w-[600px] bg-[#252526]/95 backdrop-blur-xl text-gray-200 border-gray-800/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Project Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure advanced settings for your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="framework" className="text-sm font-medium text-gray-300">Framework</Label>
              <Select>
                <SelectTrigger className="w-full bg-[#1E1E1E]/50 border-gray-700/50 focus:ring-1 focus:ring-indigo-500/25">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent className="bg-[#252526]/95 backdrop-blur-xl border-gray-700/50">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowNewProjectDialog(false)}
              className="text-gray-400 hover:text-white hover:bg-white/5 border-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 
                       text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              disabled={isProcessing}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}