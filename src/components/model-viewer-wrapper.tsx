
"use client";

// CSSProperties type removed - not directly used

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// The global JSX declaration for <model-viewer> is now in src/types/model-viewer.d.ts

interface ModelViewerWrapperProps {
  src?: string;
  alt?: string;
  style?: React.CSSProperties & {
    [key: `--${string}`]: string | number | undefined;
  };
  className?: string;
  environmentImage?: string;
  exposure?: number;
  shadowIntensity?: number;
  shadowSoftness?: number;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

const ModelViewerWrapper: React.FC<ModelViewerWrapperProps> = ({
  src,
  alt,
  style,
  className,
  environmentImage,
  exposure = 1,
  shadowIntensity = 1,
  shadowSoftness = 1,
  autoRotate = true,
  cameraControls = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false);

  useEffect(() => {
    // Check if model-viewer is already loaded
    if (typeof window !== 'undefined' && 'customElements' in window) {
      const checkModelViewer = () => {
        if (customElements.get('model-viewer')) {
          setIsModelViewerLoaded(true);
        } else {
          // If not loaded yet, wait for it
          const timeout = setTimeout(() => {
            checkModelViewer();
          }, 100);
          return () => clearTimeout(timeout);
        }
      };
      checkModelViewer();
    }

    // Mark as mounted
    setMounted(true);

    // Cleanup
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    // Reset error state when src changes
    if (src) {
      setError(null);
    }
  }, [src]);

  // Show loading state if model-viewer is not loaded yet
  if (!mounted || !isModelViewerLoaded) {
    return (
      <div style={style} className={cn("flex items-center justify-center bg-muted rounded-lg", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-sm text-muted-foreground">Loading 3D Viewer...</p>
      </div>
    );
  }

  // Show error if no source is provided
  if (!src) {
    return (
      <div style={style} className={cn("flex items-center justify-center bg-muted rounded-lg text-center p-4", className)}>
        <p className="text-sm text-muted-foreground">No 3D model source provided</p>
      </div>
    );
  }

  // Check if the source is a GLB/GLTF file and needs to go through the proxy
  const modelSrc = src?.match(/\.(glb|gltf)$/i)
    ? `/api/model-proxy?url=${encodeURIComponent(src)}`
    : src;

  // Create a style object that includes the custom properties
  const modelViewerStyle: React.CSSProperties & { [key: `--${string}`]: string | number | undefined } = {
    width: '100%',
    height: '100%',
    minHeight: '300px',
    ...style,
    '--poster-color': 'transparent'
  };

  // Render the <model-viewer> custom element
  return (
    <div className="relative w-full h-full">
      <model-viewer
        src={modelSrc}
        alt={alt || '3D Model'}
        camera-controls={cameraControls}
        auto-rotate={autoRotate}
        environment-image={environmentImage || 'neutral'}
        exposure={exposure}
        shadow-intensity={shadowIntensity}
        shadow-softness={shadowSoftness}
        skybox-image={environmentImage}
        style={modelViewerStyle}
        className={cn("rounded-lg", className)}
        onError={(e) => {
          console.error('Model Viewer Error:', e);
          setError('Failed to load 3D model. Please check the console for details.');
        }}
        onLoad={() => {
          console.log('Model loaded successfully');
          setError(null);
        }}
      ></model-viewer>

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm mb-2">{error}</p>
          <p className="text-xs text-muted-foreground">URL: {src}</p>
        </div>
      )}
    </div>
  );
};

export { ModelViewerWrapper as default };
