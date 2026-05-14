"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import type { SectionId } from "@/types/content";

interface DraggableNativeElementProps {
  id: string;
  label: string;
  section: SectionId;
  children: ReactNode;
  defaultX?: number;
  defaultY?: number;
  defaultZ?: number;
}

export default function DraggableNativeElement({
  id,
  label,
  section,
  children,
  defaultX = 50,
  defaultY = 50,
  defaultZ = 10,
}: DraggableNativeElementProps) {
  const { isAdmin, siteContent, updateElementTransform, commitHistory } = useAdmin();
  const [isDragging, setIsDragging] = useState<'move' | 'scale' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0, origScale: 1 });

  const transformState = siteContent.elementTransforms?.[id];

  // Initialize state if not present but we are admin
  useEffect(() => {
    if (isAdmin && !transformState) {
      updateElementTransform(id, { x: defaultX, y: defaultY, scale: 1, zIndex: defaultZ, label, section });
    }
  }, [isAdmin, transformState, id, label, section, defaultX, defaultY, defaultZ, updateElementTransform]);

  const x = transformState?.x ?? defaultX;
  const y = transformState?.y ?? defaultY;
  const scale = transformState?.scale ?? 1;
  const zIndex = transformState?.zIndex ?? defaultZ;

  const handleDragStart = (e: React.MouseEvent, type: 'move' | 'scale') => {
    if (!isAdmin) return;
    commitHistory();
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      origX: x,
      origY: y,
      origScale: scale,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === 'move') {
        const parent = containerRef.current?.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        
        const deltaX = ((e.clientX - dragStart.current.x) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStart.current.y) / rect.height) * 100;
        
        let newX = Math.max(0, Math.min(100, dragStart.current.origX + deltaX));
        let newY = Math.max(0, Math.min(100, dragStart.current.origY + deltaY));
        
        // Snap to 5% grid
        newX = Math.round(newX / 5) * 5;
        newY = Math.round(newY / 5) * 5;

        updateElementTransform(id, { x: newX, y: newY });
      } else if (isDragging === 'scale') {
        const scaleDelta = (e.clientX - dragStart.current.x) / 100;
        const newScale = Math.max(0.1, dragStart.current.origScale + scaleDelta);
        updateElementTransform(id, { scale: Number(newScale.toFixed(2)) });
      }
    };

    const handleMouseUp = () => setIsDragging(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, id, updateElementTransform]);

  // If not admin and not customized yet, just render children inline to not break layout
  if (!isAdmin && !transformState) {
    return <>{children}</>;
  }

  // Once initialized or in admin mode, wrap it
  return (
    <div
      ref={containerRef}
      className={`absolute transition-colors ${
        isAdmin ? "group cursor-grab active:cursor-grabbing hover:border-cyan-400 border border-transparent hover:border-dashed" : "pointer-events-none"
      } ${isDragging ? "border-cyan-400 bg-cyan-400/10" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        zIndex: zIndex,
        transformOrigin: 'top left'
      }}
      onMouseDown={(e) => handleDragStart(e, 'move')}
    >
      <div className={isAdmin ? "pointer-events-auto" : "pointer-events-auto"}>
        {children}
      </div>

      {isAdmin && (
        <div
          className={`absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full cursor-nwse-resize opacity-0 transition-opacity ${
            isDragging ? "opacity-100" : "group-hover:opacity-100"
          } z-50`}
          onMouseDown={(e) => handleDragStart(e, 'scale')}
        />
      )}
    </div>
  );
}
