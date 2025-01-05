import { editor } from 'monaco-editor';

declare module 'react' {
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    };
  }
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  theme: string;
  minimap: boolean;
  wordWrap: 'on' | 'off' | 'bounded';
  lineNumbers: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export interface FileStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children: FileStructure[];
  expanded: boolean;
}

export interface Project {
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

export interface ProjectConfig {
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

export interface GeneratedFile {
  path: string;
  content: string;
  type?: 'file' | 'directory';
}

export interface ProjectStatus {
  installing: boolean;
  running: boolean;
  error: string | null;
}

export interface ProjectMetrics {
  fileCount: number;
  totalSize: number;
  lastModified: Date | null;
  testCoverage: number;
}

export interface ProjectSettings {
  buildCommand: string;
  devCommand: string;
  installCommand: string;
  outputDirectory: string;
  nodeVersion: string;
  packageManager: string;
}

export interface TreeItemProps {
  item: FileStructure;
  onSelect: (item: FileStructure) => void;
  onToggle: (item: FileStructure) => void;
  level: number;
}

export interface Subscription {
  id: string;
  userId: string;
  paypalSubscriptionId: string | null;
  planId: string | null;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserApiLimit {
  id: string;
  userId: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFeatureUsage {
  id: string;
  userId: string;
  featureType: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}
