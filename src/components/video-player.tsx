'use client';

import { forwardRef } from 'react';

interface VideoPlayerProps extends React.HTMLAttributes<HTMLVideoElement> {
  src: string;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, className, ...props }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        controls
        controlsList="nodownload"
        className={className}
        autoPlay
        muted
        loop
        playsInline
        {...props}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
