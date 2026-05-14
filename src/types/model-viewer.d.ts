// TypeScript declaration for the <model-viewer> custom element
// This allows TypeScript to recognize the <model-viewer> tag in JSX

import type { CSSProperties as ReactCSSProperties } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        ar?: boolean;
        poster?: string;
        style?: ReactCSSProperties & { [key: `--${string}`]: string | number | undefined };
        className?: string;
        
        // Model Viewer specific attributes
        'environment-image'?: string;
        'skybox-image'?: string;
        'shadow-intensity'?: number;
        'shadow-softness'?: number;
        'exposure'?: number;
        'camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'max-camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'max-field-of-view'?: string;
        'min-field-of-view'?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-threshold'?: string;
        'interaction-policy'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: number;
        'ar'?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'ios-src'?: string;
        'touch-action'?: string;
        'disable-zoom'?: boolean;
        'orbit-sensitivity'?: number;
        'interpolation-decay'?: number;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: number;
        'rotation-per-second'?: string;
        'camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'max-camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'max-field-of-view'?: string;
        'min-field-of-view'?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-threshold'?: string;
        'interaction-policy'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: number;
        'ar'?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'ios-src'?: string;
        'touch-action'?: string;
        'disable-zoom'?: boolean;
        'orbit-sensitivity'?: number;
        'interpolation-decay'?: number;
        'onError'?: (event: Event) => void;
        'onLoad'?: () => void;
      }, HTMLElement>;
    }
  }
}

// Export an empty object to ensure this file is treated as a module.
// This is sometimes necessary for global augmentations to be picked up.
export {};
