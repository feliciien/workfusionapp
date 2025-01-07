import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  maxRetries?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallbackSrc,
  maxRetries = 3,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      // Retry loading the image
      setRetryCount(prev => prev + 1);
      setCurrentSrc(`${src}?retry=${retryCount + 1}`);
    } else if (fallbackSrc) {
      // Use fallback image if available
      setCurrentSrc(fallbackSrc);
      setError(null);
    } else {
      setError('Failed to load image');
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={() => {
          setIsLoading(false);
          setError(null);
        }}
        onError={(e) => {
          console.error('Image loading error:', {
            src: currentSrc,
            error: e
          });
          handleError();
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}
    </div>
  );
}
