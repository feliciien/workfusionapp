import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  contentClassName?: string;
}

export function PageLayout({
  children,
  header,
  footer,
  className,
  mainClassName,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}

      <main className={cn("flex-1", mainClassName)}>
        <div className={cn("container mx-auto px-4 py-8", contentClassName)}>
          {children}
        </div>
      </main>

      {footer && <footer className="border-t">{footer}</footer>}

      <Analytics />
    </div>
  );
}

export function PageHeader({
  heading,
  text,
  children,
}: {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center mb-8">
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
        {heading}
      </h1>
      {text && (
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          {text}
        </p>
      )}
      {children}
    </div>
  );
}

export function PageSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-heading` : undefined}
      className={cn("py-8 md:py-12", className)}
    >
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2
              id={`${id}-heading`}
              className="text-2xl font-bold leading-tight tracking-tighter md:text-3xl mb-3"
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
