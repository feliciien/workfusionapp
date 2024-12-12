// components/loader.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-gray-900", className)}></div>
  );
};