export interface CodeAnalysis {
  complexity: number;
  linesOfCode: number;
  dependencies: string[];
  suggestions: string[];
  securityIssues: string[];
  performance: {
    score: number;
    issues: string[];
  };
}

export interface FileStats {
  path: string;
  size: number;
  lastModified: Date;
  type: string;
  imports: string[];
}

function countLinesOfCode(code: string): number {
  return code.split('\n').filter(line => 
    line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*')
  ).length;
}

function findDependencies(code: string): string[] {
  const dependencies = new Set<string>();
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    dependencies.add(match[1]);
  }
  while ((match = requireRegex.exec(code)) !== null) {
    dependencies.add(match[1]);
  }
  
  return Array.from(dependencies);
}

function calculateComplexity(code: string): number {
  let complexity = 0;
  
  // Count control structures
  const controlStructures = [
    'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'catch', 'try', '\\?\\.', '\\|\\|', '&&'
  ];
  
  controlStructures.forEach(structure => {
    const regex = new RegExp(`\\b${structure}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  // Count nested functions and classes
  const nestedStructures = code.match(/class\s+\w+|function\s+\w+|\(\s*\)\s*=>/g);
  if (nestedStructures) {
    complexity += nestedStructures.length * 2;
  }
  
  return complexity;
}

function analyzeSecurity(code: string): string[] {
  const issues: string[] = [];
  
  // Check for common security issues
  if (code.includes('eval(')) {
    issues.push('Critical: Avoid using eval() as it can execute malicious code. Use safer alternatives like JSON.parse() for JSON data.');
  }
  if (code.includes('innerHTML')) {
    issues.push('High: Use textContent or innerText instead of innerHTML to prevent XSS attacks. If HTML is needed, consider using DOMPurify.');
  }
  if (code.match(/password|secret|key/i) && code.includes('console.log')) {
    issues.push('Critical: Avoid logging sensitive information. Remove any console.log statements containing passwords, secrets, or keys.');
  }
  if (code.match(/http:|ws:/)) {
    issues.push('Medium: Use secure protocols (https:, wss:) instead of unencrypted connections.');
  }
  if (code.includes('localStorage') || code.includes('sessionStorage')) {
    issues.push('Medium: Be cautious with browser storage. Never store sensitive data in localStorage/sessionStorage.');
  }
  if (code.match(/new\s+Function|setTimeout.*eval/)) {
    issues.push('Critical: Avoid dynamic code execution. Use proper function declarations instead.');
  }
  
  return issues;
}

function analyzePerformance(code: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  
  // Check for performance issues
  if (code.match(/\.\.\.\w+/g)) {
    const spreadCount = (code.match(/\.\.\.\w+/g) || []).length;
    if (spreadCount > 2) {
      issues.push('Medium: Multiple spread operators detected. Consider using Object.assign() or array methods for better performance with large datasets.');
      score -= spreadCount * 3;
    }
  }

  if (code.match(/forEach|map|filter|reduce/g)) {
    const matches = code.match(/forEach|map|filter|reduce/g) || [];
    if (matches.length > 3) {
      issues.push('Medium: Multiple array operations chained together. Consider combining operations or using a traditional for loop for better performance.');
      score -= matches.length * 2;
    }
  }

  if (code.includes('async') && !code.includes('try') && !code.includes('catch')) {
    issues.push('High: Missing error handling in async operations. Add try/catch blocks to handle potential errors.');
    score -= 10;
  }

  const deepNesting = code.match(/\{[^{}]*\{[^{}]*\{[^{}]*\}/g);
  if (deepNesting) {
    issues.push('Medium: Deep nesting detected. Consider extracting nested logic into separate functions for better readability and maintainability.');
    score -= deepNesting.length * 5;
  }

  if (code.match(/setInterval|setTimeout/g)) {
    issues.push('Low: Timer functions detected. Ensure they are properly cleaned up to prevent memory leaks.');
    score -= 3;
  }

  if (code.match(/querySelector(All)?/g)) {
    const matches = code.match(/querySelector(All)?/g) || [];
    if (matches.length > 5) {
      issues.push('Medium: Multiple DOM queries detected. Consider caching DOM elements for better performance.');
      score -= matches.length;
    }
  }
  
  return { score: Math.max(0, score), issues };
}

function generateSuggestions(code: string, complexity: number, linesOfCode: number): string[] {
  const suggestions: string[] = [];
  
  // Complexity-based suggestions
  if (complexity > 20) {
    suggestions.push('High: Consider breaking down complex functions into smaller, more manageable pieces. Aim for functions that do one thing well.');
  }
  if (complexity > 15) {
    suggestions.push('Medium: Look for opportunities to simplify conditional logic using early returns or switch statements.');
  }

  // Code size suggestions
  if (linesOfCode > 300) {
    suggestions.push('High: File is quite large. Consider splitting it into multiple modules for better maintainability.');
  }
  if (linesOfCode > 200) {
    suggestions.push('Medium: Consider extracting some functionality into separate components or utility functions.');
  }

  // Pattern-based suggestions
  if (code.includes('class') && !code.includes('implements') && !code.includes('extends')) {
    suggestions.push('Low: Consider using interfaces or inheritance to promote code reuse and type safety.');
  }

  if (code.match(/console\.(log|warn|error)/g)) {
    suggestions.push('Low: Remove or replace console statements with proper logging mechanism for production code.');
  }

  if (code.match(/any/g)) {
    suggestions.push('Medium: Avoid using "any" type. Specify proper TypeScript types to improve type safety.');
  }

  if (code.match(/\!\w+/g)) {
    suggestions.push('Low: Non-null assertions (!.) should be used sparingly. Consider proper null checks instead.');
  }

  if (code.match(/\.bind\(this\)/g)) {
    suggestions.push('Low: Consider using arrow functions instead of .bind(this) for better readability.');
  }

  return suggestions;
}

export async function analyzeCode(code: string): Promise<CodeAnalysis> {
  try {
    const linesOfCode = countLinesOfCode(code);
    const dependencies = findDependencies(code);
    const complexity = calculateComplexity(code);
    const securityIssues = analyzeSecurity(code);
    const performance = analyzePerformance(code);
    const suggestions = generateSuggestions(code, complexity, linesOfCode);
    
    return {
      complexity,
      linesOfCode,
      dependencies,
      suggestions,
      securityIssues,
      performance
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
}

// Mock data for project-wide analysis
export async function getProjectStats(projectPath: string): Promise<FileStats[]> {
  // Return mock data since we can't access the file system in the browser
  return [
    {
      path: 'app/page.tsx',
      size: 2500,
      lastModified: new Date(),
      type: 'tsx',
      imports: ['react', 'next/app']
    },
    {
      path: 'components/ui/button.tsx',
      size: 1200,
      lastModified: new Date(),
      type: 'tsx',
      imports: ['react', '@radix-ui/react-slot']
    },
    {
      path: 'lib/utils.ts',
      size: 800,
      lastModified: new Date(),
      type: 'ts',
      imports: ['clsx', 'tailwind-merge']
    }
  ];
}

export async function generateCodeReport(projectPath: string): Promise<string> {
  const stats = await getProjectStats(projectPath);
  
  let report = '# Code Analysis Report\n\n';
  
  // Project Overview
  report += '## Project Overview\n';
  report += `- Total Files: ${stats.length}\n`;
  report += `- Total Size: ${(stats.reduce((acc, stat) => acc + stat.size, 0) / 1024 / 1024).toFixed(2)} MB\n`;
  report += `- File Types: ${Array.from(new Set(stats.map(s => s.type))).join(', ')}\n\n`;
  
  // Add mock analysis data
  report += '## Key Findings\n';
  report += '- Code complexity is within acceptable ranges\n';
  report += '- No critical security issues found\n';
  report += '- Performance optimizations recommended for large array operations\n';
  
  return report;
}
