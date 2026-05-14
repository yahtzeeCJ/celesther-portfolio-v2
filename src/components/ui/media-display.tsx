'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { FileRenameDialog } from './file-rename-dialog';

interface MediaDisplayProps {
  src: string;
  alt?: string;
  type?: 'image' | 'video';
  className?: string;
  width?: number;
  height?: number;
  onRename?: (newSrc: string) => void;
  onRenameRequest?: (newName: string) => Promise<boolean>;
}

export default function MediaDisplay({
  src,
  alt = 'Media',
  type = 'image',
  className = '',
  width = 600,
  height = 800,
  onRename,
  onRenameRequest,
}: MediaDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAdmin } = useAdmin();

  // Extract file name from URL for display
  const fileName = src.split('/').pop() || '';
  const [displayName, setDisplayName] = useState(fileName);

  // Update display name when src changes
  useEffect(() => {
    setDisplayName(src.split('/').pop() || '');
  }, [src]);

  const handleRename = async (newName: string) => {
    if (!onRenameRequest) return false;

    try {
      const success = await onRenameRequest(newName);
      if (success && onRename) {
        // Update the display name
        const url = new URL(src);
        const pathParts = url.pathname.split('/');
        const fileNameParts = pathParts.pop()?.split('.') || [];
        const extension = fileNameParts.length > 1 ? fileNameParts.pop() : '';
        const newFileName = extension ? `${newName}.${extension}` : newName;
        pathParts.push(newFileName);
        url.pathname = pathParts.join('/');

        onRename(url.toString());
        setDisplayName(newFileName);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`bg-muted rounded-md w-full h-96 md:h-[30rem] animate-pulse ${className}`} />
    );
  }

  const mediaContent = type === 'video' ? (
    <video
      src={src}
      controls
      controlsList="nodownload"
      className={`rounded-md object-cover w-full h-96 md:h-[30rem] ${className}`}
      autoPlay
      muted
      loop
      playsInline
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Your browser does not support the video tag.
    </video>
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-md object-cover w-full h-96 md:h-[30rem] ${className}`}
      priority
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );

  return (
    <div className="relative group">
      {mediaContent}

      {isAdmin && (
        <>
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              <Pencil className="h-6 w-6" />
            </Button>
          </div>

          {onRenameRequest && (
            <FileRenameDialog
              open={isRenaming}
              onOpenChange={setIsRenaming}
              currentPath={src}
              onRename={handleRename}
            />
          )}
        </>
      )}

      {/* Display file name at the bottom */}
      <div className="mt-2 text-sm text-muted-foreground truncate">
        {displayName}
      </div>
    </div>
  );
}
