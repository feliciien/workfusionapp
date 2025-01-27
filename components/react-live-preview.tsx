// Use client-side rendering
"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ReactLivePreviewProps {
  code: string;
  language: string;
}

const ReactLivePreview: React.FC<ReactLivePreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      const iframe = iframeRef.current;

      // Create a blob URL for the iframe src
      const blob = new Blob([code], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);

      iframe.src = blobUrl;

      // Clean up old blob URLs
      const oldBlobUrl = iframe.dataset.blobUrl;
      if (oldBlobUrl) {
        URL.revokeObjectURL(oldBlobUrl);
      }
      iframe.dataset.blobUrl = blobUrl;

      // Handle iframe load event
      const handleLoad = () => setIsLoading(false);
      iframe.addEventListener("load", handleLoad);

      // Clean up when component unmounts or code changes
      return () => {
        URL.revokeObjectURL(blobUrl);
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [code]);

  return (
    <div className='relative w-full h-full min-h-[300px] bg-background rounded-lg overflow-hidden border'>
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
          <div className='flex flex-col items-center space-y-2'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <p className='text-sm text-muted-foreground'>Loading preview...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className='w-full h-full transition-opacity duration-200'
        style={{ opacity: isLoading ? 0 : 1 }}
        sandbox='allow-scripts allow-same-origin'
        title='Live Preview'
      />
    </div>
  );
};

export default ReactLivePreview;
