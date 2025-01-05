import { getAuthSession } from "@/lib/auth-helper";
import { NextResponse } from "next/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import OpenAI from 'openai';

// Initialize OpenAI client
let openai: OpenAI | null = null;

try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    throw new Error('OpenAI API key is not configured');
  }
  openai = new OpenAI({ apiKey });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

const FRAMEWORK_VERSIONS = {
  next: "14.0.4",
  react: "18.2.0",
  typescript: "5.3.3",
  tailwindcss: "3.4.0",
  eslint: "8.56.0",
  prettier: "3.1.1"
};

const BASE_DEPENDENCIES = {
  development: {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": FRAMEWORK_VERSIONS.eslint,
    "eslint-config-next": "14.0.4",
    "eslint-config-prettier": "^9.1.0",
    "prettier": FRAMEWORK_VERSIONS.prettier,
    "typescript": FRAMEWORK_VERSIONS.typescript
  },
  production: {
    "next": FRAMEWORK_VERSIONS.next,
    "react": FRAMEWORK_VERSIONS.react,
    "react-dom": FRAMEWORK_VERSIONS.react,
    "tailwindcss": FRAMEWORK_VERSIONS.tailwindcss,
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "@heroicons/react": "^2.1.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "framer-motion": "^10.17.9",
    "lucide-react": "^0.303.0",
    "@radix-ui/react-icons": "^1.0.0" // Added dependency
  }
};

type TemplateId = 'next-fullstack' | 'next-landing' | 'next-ecommerce' | 'next-saas';

interface TemplateConfig {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
  'next-fullstack': {
    dependencies: {
      '@prisma/client': '^5.7.1',
      '@clerk/nextjs': '^4.29.1',
      '@tanstack/react-query': '^5.17.1',
      'zod': '^3.22.4',
      'axios': '^1.6.3',
      '@radix-ui/react-icons': "^1.0.0" // Ensure it's included here if specific to a template
    },
    devDependencies: {
      'prisma': '^5.7.1',
      '@types/node': '^20.10.6',
      '@types/react': '^18.2.46',
      'jest': '^29.7.0',
      '@testing-library/react': '^14.1.2'
    }
  },
  'next-landing': {
    dependencies: {
      'framer-motion': '^10.17.9',
      'next-mdx-remote': '^4.4.1',
      'next-seo': '^6.4.0',
      'react-intersection-observer': '^9.5.3',
      '@radix-ui/react-icons': "^1.0.0" // Ensure it's included here if specific to a template
    },
    devDependencies: {
      '@types/node': '^20.10.6',
      '@types/react': '^18.2.46',
      'contentlayer': '^0.3.4',
      'next-contentlayer': '^0.3.4'
    }
  },
  'next-ecommerce': {
    dependencies: {
      '@stripe/stripe-js': '^2.2.2',
      'stripe': '^14.10.0',
      '@prisma/client': '^5.7.1',
      'zustand': '^4.4.7',
      'react-hot-toast': '^2.4.1',
      '@radix-ui/react-icons': "^1.0.0" // Ensure it's included here if specific to a template
    },
    devDependencies: {
      'prisma': '^5.7.1',
      '@types/node': '^20.10.6',
      '@types/react': '^18.2.46',
      'jest': '^29.7.0',
      '@testing-library/react': '^14.1.2'
    }
  },
  'next-saas': {
    dependencies: {
      '@trpc/client': '^10.45.0',
      '@trpc/server': '^10.45.0',
      '@trpc/react-query': '^10.45.0',
      '@stripe/stripe-js': '^2.2.2',
      'stripe': '^14.10.0',
      '@prisma/client': '^5.7.1',
      '@radix-ui/react-icons': "^1.0.0" // Ensure it's included here if specific to a template
    },
    devDependencies: {
      'prisma': '^5.7.1',
      '@types/node': '^20.10.6',
      '@types/react': '^18.2.46',
      'jest': '^29.7.0',
      '@testing-library/react': '^14.1.2'
    }
  }
};

interface GeneratedFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

interface ProjectStructure {
  name: string;
  description: string;
  files: GeneratedFile[];
  dependencies?: {
    production?: Record<string, string>;
    development?: Record<string, string>;
  };
  scripts?: Record<string, string>;
}

const systemPrompt = `You are an expert software developer specializing in modern web development with Next.js, React, and TypeScript.

Your task is to generate high-quality, production-ready code based on the user's requirements.

CRITICAL REQUIREMENTS:
1. Write clean, maintainable code following best practices
2. Include proper TypeScript types and interfaces
3. Implement proper error handling and input validation
4. Add comprehensive comments explaining complex logic
5. Follow modern React patterns (hooks, functional components)
6. Ensure responsive design and accessibility
7. Include proper testing setup and example tests
8. Structure the project following Next.js 14 conventions
9. Use proper dependency management and versioning

OUTPUT FORMAT:
Return a JSON object with:
{
  "name": "project name",
  "description": "project description",
  "files": [
    {
      "path": "relative/path/to/file",
      "content": "file content",
      "type": "file" | "directory"
    }
  ],
  "dependencies": {
    "production": { "package": "version" },
    "development": { "package": "version" }
  },
  "scripts": {
    "script-name": "command"
  }
}`;

const generateGitIgnore = () => `
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
 /out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
`;

const generateTsConfig = () => ({
  compilerOptions: {
    target: "es5",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [
      {
        name: "next"
      }
    ],
    paths: {
      "@/*": ["./*"]
    }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
});

const generateEslintConfig = () => ({
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
});

const generatePrettierConfig = () => ({
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  tabWidth: 2,
  useTabs: false
});

const generateTailwindConfig = () => `
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
`;

const generatePostCssConfig = () => `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

async function generateCode(prompt: string, context: string): Promise<ProjectStructure> {
  if (!openai) {
    console.error('OpenAI client not initialized');
    throw new Error('OpenAI client not initialized');
  }

  try {
    console.log('Starting OpenAI request with prompt:', prompt);
    console.log('Using model: gpt-4-1106-preview');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate a complete Next.js project based on this description: ${prompt}

Your response must be a valid JSON object with this exact structure:
{
  "name": "project-name",
  "description": "Project description",
  "files": [
    {
      "path": "relative/path/to/file",
      "content": "file content",
      "type": "file"
    }
  ],
  "dependencies": {
    "production": {
      "next": "^14.0.4",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "development": {
      "typescript": "^5.3.3",
      "@types/node": "^20.10.6",
      "@types/react": "^18.2.46"
    }
  }
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI API call completed');
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      console.error('No content in OpenAI response');
      throw new Error('No response from OpenAI');
    }

    console.log('Response received, length:', response.length);
    console.log('First 100 chars of response:', response.substring(0, 100));

    try {
      console.log('Attempting to parse response as JSON');
      const parsedResponse = JSON.parse(response);
      console.log('Successfully parsed response as JSON');
      
      // Validate response structure
      if (!parsedResponse.name || !parsedResponse.description || !Array.isArray(parsedResponse.files)) {
        console.error('Invalid response structure. Missing required fields:', {
          hasName: !!parsedResponse.name,
          hasDescription: !!parsedResponse.description,
          hasFiles: Array.isArray(parsedResponse.files)
        });
        throw new Error('Invalid response structure from AI: missing required fields');
      }

      console.log('Response structure validation passed');
      console.log('Number of files:', parsedResponse.files.length);

      // Validate each file has required fields
      parsedResponse.files.forEach((file: GeneratedFile, index: number) => {
        if (!file.path) {
          console.error(`File at index ${index} is missing path`);
          throw new Error(`File at index ${index} is missing path`);
        }
        if (typeof file.content !== 'string') {
          console.error(`File at index ${index} (${file.path}) is missing content`);
          throw new Error(`File at index ${index} (${file.path}) is missing content`);
        }
        if (!file.type) {
          console.log(`File at index ${index} (${file.path}): defaulting type to 'file'`);
          file.type = 'file';
        }
      });

      console.log('File validation passed for all files');
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response that failed to parse:', response);
      throw new Error('Failed to parse AI response: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
    }
  } catch (error) {
    console.error('Error in generateCode:', error);
    if (error instanceof Error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
    throw new Error(`AI generation failed: ${String(error)}`);
  }
}

export async function POST(req: Request) {
  try {
    console.log('[CODE_GENERATE] Starting code generation...');
    
    const { userId } = await getAuthSession();
    console.log('[CODE_GENERATE] User ID:', userId);
    
    const body = await req.json();
    const { prompt } = body;
    console.log('[CODE_GENERATE] Prompt:', prompt);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit(userId);
    const isPro = await checkSubscription(userId);

    console.log('[CODE_GENERATE] User status:', { freeTrial, isPro });

    if (!freeTrial && !isPro) {
      console.log('[CODE_GENERATE] Error: Free trial expired');
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    try {
      console.log('[CODE_GENERATE] Starting code generation with prompt:', prompt);
      const generatedProject = await generateCode(prompt, 'project structure');
      console.log('[CODE_GENERATE] Project generated successfully');

      if (!isPro) {
        await increaseApiLimit(userId);
      }

      return NextResponse.json(generatedProject);
    } catch (error) {
      console.error('[CODE_GENERATE] Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate code';
      console.error('[CODE_GENERATE] Returning error to client:', errorMessage);
      return new NextResponse(errorMessage, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  } catch (error) {
    console.error('[CODE_GENERATE] Fatal error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}