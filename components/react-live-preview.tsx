// Use client-side rendering
"use client";

import React, { useEffect, useRef } from "react";

export interface ReactLivePreviewProps {
  code: string;
  language: string;
}

const ReactLivePreview: React.FC<ReactLivePreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;

      // Create a blob URL for the iframe src
      const blob = new Blob([code], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      iframe.src = blobUrl;

      // Clean up old blob URLs
      const oldBlobUrl = iframe.dataset.blobUrl;
      if (oldBlobUrl) {
        URL.revokeObjectURL(oldBlobUrl);
      }
      iframe.dataset.blobUrl = blobUrl;

      // Clean up when component unmounts
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: '100%', height: '100%', border: 'none' }}
      sandbox="allow-scripts allow-same-origin"
      title="Live Preview"
    />
  );
};

export default ReactLivePreview;
