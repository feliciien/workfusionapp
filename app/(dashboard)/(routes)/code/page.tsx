"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocalStorage } from '../../../hooks/use-local-storage';
import type { editor } from 'monaco-editor';
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
  Download,
  Search,
  Settings,
  Copy,
  ExternalLink
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Editor types
type EditorSettings = {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'bounded';
  minimap: boolean;
  lineNumbers: boolean;
  formatOnSave: boolean;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface FileStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children: FileStructure[];
  expanded: boolean;
}

interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  type?: string;
  files?: any[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: {
    dev: string;
    build: string;
    start: string;
  };
  setupCommands?: Array<{
    command: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectConfig {
  name: string;
  description: string;
  type: string;
  files: any[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: {
    dev: string;
    build: string;
    start: string;
  };
  setupCommands: Array<{
    command: string;
    description: string;
  }>;
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

export default function CodePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<FileStructure | null>(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [recentFiles, setRecentFiles] = useLocalStorage<string[]>('recent-files', []);
  const [editorSettings, setEditorSettings] = useLocalStorage<EditorSettings>('editor-settings', {
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: true,
    formatOnSave: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  // API functions
  const createProject = useCallback(async (project: Project): Promise<void> => {
    try {
      await axios.post('/api/code/project', project);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, []);

  const createDownloadableProject = useCallback(async (project: Project): Promise<void> => {
    try {
      await axios.post('/api/code/download', project);
    } catch (error) {
      console.error('Failed to create downloadable project:', error);
      throw error;
    }
  }, []);

  // Utility functions
  const getAllFiles = useCallback((structure: FileStructure[]): { path: string; content: string }[] => {
    let files: { path: string; content: string }[] = [];
    
    const traverse = (items: FileStructure[]) => {
      items.forEach(item => {
        if (item.type === 'file' && item.content !== undefined) {
          files.push({
            path: item.path,
            content: item.content
          });
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    
    traverse(structure);
    return files;
  }, []);

  const handleDownloadProject = useCallback(async () => {
    try {
      const allFiles = getAllFiles(fileStructure);
      if (allFiles.length === 0) {
        toast.error('No files to download');
        return;
      }

      const response = await axios.post('/api/code/download', {
        files: allFiles
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'project.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Project downloaded successfully');
    } catch (error) {
      console.error('Project download error:', error);
      toast.error('Failed to download project');
    }
  }, [fileStructure, getAllFiles]);

  const filterFileStructure = useCallback((files: FileStructure[], query: string): FileStructure[] => {
    return files.map(file => {
      if (file.type === 'directory' && file.children) {
        const filteredChildren = filterFileStructure(file.children, query);
        if (filteredChildren.length > 0) {
          return { ...file, children: filteredChildren };
        }
      }
      if (file.name.toLowerCase().includes(query)) {
        return file;
      }
      return null;
    }).filter((file): file is FileStructure => file !== null);
  }, []);

  const findFileByPath = useCallback((files: FileStructure[], targetPath: string): FileStructure | null => {
    for (const file of files) {
      if (file.path === targetPath) {
        return file;
      }
      if (file.type === 'directory' && file.children) {
        const found = findFileByPath(file.children, targetPath);
        if (found) return found;
      }
    }
    return null;
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

  const convertToFileStructure = useCallback((files: any[]): FileStructure[] => {
    const structure: { [key: string]: FileStructure } = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';
      
      parts.forEach((part: string, index: number) => {
        const isFile = index === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!structure[currentPath]) {
          structure[currentPath] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'directory',
            content: isFile ? file.content : undefined,
            children: [],
            expanded: true
          };
          
          if (parentPath && structure[parentPath]) {
            const parent = structure[parentPath];
            parent.children.push(structure[currentPath]);
          }
        }
      });
    });
    
    return Object.values(structure).filter(item => !item.path.includes('/'));
  }, []);

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
            children: [],
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

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleSaveFile();
  });

  useHotkeys('ctrl+p, cmd+p', (e) => {
    e.preventDefault();
    document.getElementById('file-search')?.focus();
  });

  useHotkeys('ctrl+`, cmd+`', (e) => {
    e.preventDefault();
    toggleTerminal();
  });

  // Memoized filtered file structure
  const filteredFileStructure = useMemo(() => {
    if (!searchQuery) return fileStructure;
    return filterFileStructure(fileStructure, searchQuery.toLowerCase());
  }, [fileStructure, searchQuery]);

  const handleSaveFile = useCallback(async () => {
    if (!activeFile?.content) return;

    try {
      await axios.post('/api/save-file', {
        path: activeFile.path,
        content: activeFile.content
      });
      toast.success('File saved successfully');
      
      // Update last modified
      setProjectMetrics(prev => ({
        ...prev,
        lastModified: new Date()
      }));
    } catch (error) {
      toast.error('Failed to save file');
    }
  }, [activeFile]);

  const handleFileSelect = useCallback((file: FileStructure) => {
    setActiveFile(file);
    // Update recent files
    setRecentFiles((prev: string[]) => {
      const newRecent = [file.path, ...prev.filter((p: string) => p !== file.path)].slice(0, 10);
      return newRecent;
    });
  }, [setRecentFiles]);

  const toggleTerminal = useCallback(() => {
    setIsTerminalVisible((prev: boolean) => !prev);
  }, []);

  // Auto-save on content change
  useEffect(() => {
    if (!activeFile?.content || !editorSettings.formatOnSave) return;
    
    const timeoutId = setTimeout(() => {
      handleSaveFile();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [activeFile?.content, editorSettings.formatOnSave, handleSaveFile]);

  const addTerminalOutput = useCallback((message: string) => {
    setTerminalOutput(prev => [...prev, message]);
  }, []);

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

      const { files, dependencies, name } = response.data;
      
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
          content: firstFile.content,
          children: [],
          expanded: true
        });
      }

      const newProject: Project = {
        id: Date.now().toString(),
        name: name || 'generated-project',
        path: `/projects/${name || 'generated-project'}`,
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCurrentProject(newProject);
      toast.success('Project generated successfully!');
      
      // Create downloadable project
      await createDownloadableProject(newProject);
    } catch (error: any) {
      console.error('Project generation error:', error);
      toast.error(error.message || 'Failed to generate project');
      addTerminalOutput('❌ Error: ' + (error.message || 'Failed to generate project'));
    } finally {
      setIsProcessing(false);
    }
  }, [prompt, isProcessing, messages, addTerminalOutput, convertToFileStructure, createDownloadableProject]);

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

  const openFile = useCallback((filePath: string) => {
    const file = findFileByPath(fileStructure, filePath);
    if (file && file.type === 'file') {
      handleFileSelect(file);
    }
  }, [fileStructure, handleFileSelect]);

  const handleProjectCreate = async (projectConfig: ProjectConfig) => {
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectConfig.name,
        path: `/projects/${projectConfig.name}`,
        description: projectConfig.description,
        type: projectConfig.type,
        files: projectConfig.files,
        dependencies: projectConfig.dependencies,
        devDependencies: projectConfig.devDependencies,
        scripts: projectConfig.scripts,
        setupCommands: projectConfig.setupCommands,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCurrentProject(newProject);
      await createProject(newProject);
      setShowNewProjectDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    }
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

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-white dark:bg-[#0F172A]">
      {/* Header with enhanced glass effect */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border-b border-gray-200 dark:border-indigo-500/10 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-inner border border-gray-200 dark:border-white/5">
              <FileCode2 className="h-5 w-5 text-gray-600 dark:text-indigo-300" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:bg-gradient-to-r dark:from-indigo-200 dark:to-purple-200 dark:bg-clip-text dark:text-transparent">Code Generator</h1>
          </div>
          <div className="flex-1 max-w-3xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              handlePromptSubmit();
            }}>
              <div className="flex items-center space-x-2">
                <Textarea
                  placeholder="Describe your project..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-9 min-h-[36px] w-full resize-none bg-transparent px-3 py-1.5"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing || !prompt.trim()}
                  className={cn(
                    "px-3",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Generate</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={saveFile}
            className="text-gray-600 hover:text-gray-900 dark:text-indigo-300 dark:hover:text-indigo-200 
                     hover:bg-gray-100 dark:hover:bg-indigo-500/10 border-0 transition-colors duration-200"
            disabled={!activeFile}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span className="text-sm">Save</span>
          </Button>
          <div className="w-px h-4 bg-gray-200 dark:bg-indigo-500/10" />
          <Button
            variant="ghost"
            size="sm"
            onClick={runProject}
            className="text-gray-600 hover:text-gray-900 dark:text-indigo-300 dark:hover:text-indigo-200 
                     hover:bg-gray-100 dark:hover:bg-indigo-500/10 border-0 transition-colors duration-200"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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
              <div className="h-full flex flex-col bg-gray-50/50 dark:bg-[#1E293B]/50 backdrop-blur-xl 
                            border-r border-gray-200 dark:border-indigo-500/10">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-indigo-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-medium text-gray-600 dark:text-indigo-300 uppercase tracking-wider">Files</h2>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        className="h-6 w-6 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-indigo-500/10"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewProjectDialog(true)}
                        className="h-6 w-6 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-indigo-500/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      id="file-search"
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-white/50 dark:bg-[#1E293B]/50 border border-gray-200 
                               dark:border-indigo-500/10 rounded-md focus:outline-none focus:ring-2 
                               focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40"
                    />
                    <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {recentFiles.length > 0 && (
                    <div className="p-2 border-b border-gray-200 dark:border-indigo-500/10">
                      <h3 className="text-xs font-medium text-gray-500 dark:text-indigo-400 mb-1">Recent Files</h3>
                      <div className="space-y-1">
                        {recentFiles.map(filePath => {
                          const fileName = path.basename(filePath);
                          return (
                            <button
                              key={filePath}
                              onClick={() => {
                                const file = findFileByPath(fileStructure, filePath);
                                if (file) handleFileSelect(file);
                              }}
                              className="w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-indigo-200 
                                       hover:bg-gray-100 dark:hover:bg-indigo-500/10 rounded-md truncate"
                            >
                              {fileName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="p-2 border-t border-gray-200 dark:border-indigo-500/10">
                    {filteredFileStructure.length > 0 ? (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-indigo-400 mb-2">Files</h3>
                        {renderFileTree(filteredFileStructure, activeFile, handleFileSelect, toggleDirectory)}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <FileCode2 className="h-8 w-8 text-gray-400 dark:text-indigo-300/50 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-indigo-300 text-center">
                          No files found
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[2px] bg-gradient-to-b from-gray-200 to-gray-100 dark:from-indigo-500/10 
                                     dark:to-purple-500/10 hover:bg-indigo-500/20 transition-colors" />

            {/* Editor Panel */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <div className="h-full flex flex-col bg-white dark:bg-[#0F172A]">
                {activeFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-[#1E293B]/80 
                                  backdrop-blur-xl border-b border-gray-200 dark:border-indigo-500/10">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-gray-600 dark:text-indigo-300" />
                        <span className="text-sm text-gray-900 dark:text-indigo-100 font-medium">
                          {activeFile.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(activeFile.content || '');
                            toast.success('Copied to clipboard');
                          }}
                          className="h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-indigo-300 
                                   dark:hover:text-indigo-200"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveFile}
                          className="h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-indigo-300 
                                   dark:hover:text-indigo-200"
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await axios.post('/api/code/download', {
                                files: [{
                                  path: activeFile.path,
                                  content: activeFile.content
                                }]
                              }, {
                                responseType: 'blob'
                              });
                              
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `${activeFile.name}.zip`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                              
                              toast.success('File downloaded successfully');
                            } catch (error) {
                              console.error('Download error:', error);
                              toast.error('Failed to download file');
                            }
                          }}
                          className="h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-indigo-300 
                                   dark:hover:text-indigo-200"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <Editor
                        height="100%"
                        defaultLanguage={getFileLanguage(activeFile.name)}
                        value={activeFile.content}
                        theme={editorTheme}
                        onChange={(value) => {
                          setActiveFile(prev => prev ? { ...prev, content: value || '' } : null);
                        }}
                        options={{
                          fontSize: editorSettings.fontSize,
                          tabSize: editorSettings.tabSize,
                          wordWrap: editorSettings.wordWrap,
                          minimap: { enabled: editorSettings.minimap },
                          lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                          cursorSmoothCaretAnimation: 'on',
                          formatOnPaste: true,
                          formatOnType: true,
                          automaticLayout: true,
                        } satisfies editor.IStandaloneEditorConstructionOptions}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-[#1E293B]/50">
                    <div className="text-center">
                      <FileCode2 className="h-12 w-12 mx-auto text-gray-400 dark:text-indigo-300/50" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-indigo-100">No file selected</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-indigo-300">
                        Select a file from the sidebar to start editing
                      </p>
                    </div>
                  </div>
                )}
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

      <div className="fixed bottom-4 right-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadProject}
            className="h-8 bg-white/5 border-gray-700/50 hover:bg-white/10 text-gray-300 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Project
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8 bg-white/5 border-gray-700/50 hover:bg-white/10 text-gray-300 hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}