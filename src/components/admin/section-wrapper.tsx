'use client';

import { type ReactNode, useCallback, useRef, useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import type { SectionId } from '@/types/content';

interface AdminSectionWrapperProps {
  sectionId: SectionId;
  children: ReactNode;
}

const ANIMATION_KEYFRAMES: Record<string, string> = {
  fadeIn: 'from { opacity: 0; } to { opacity: 1; }',
  slideUp: 'from { opacity: 0; transform: translate(-50%, -50%) translateY(40px); } to { opacity: 1; transform: translate(-50%, -50%) translateY(0); }',
  slideLeft: 'from { opacity: 0; transform: translate(-50%, -50%) translateX(40px); } to { opacity: 1; transform: translate(-50%, -50%) translateX(0); }',
  scaleIn: 'from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); }',
};

function getTextStyle(block: {
  x: number; y: number; scale: number; fontFamily: string; fontSize: number;
  fontWeight: string; color: string; letterSpacing: number; lineHeight: number;
  zIndex: number; strokeColor?: string; strokeWidth?: number; fillTransparent?: boolean;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${block.x}%`,
    top: `${block.y}%`,
    transform: `translate(-50%, -50%) scale(${block.scale})`,
    fontFamily: block.fontFamily,
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    color: block.fillTransparent ? 'transparent' : block.color,
    letterSpacing: `${block.letterSpacing}px`,
    lineHeight: block.lineHeight,
    zIndex: block.zIndex,
    whiteSpace: 'pre-wrap',
  };

  if (block.strokeWidth && block.strokeWidth > 0) {
    (style as Record<string, unknown>).WebkitTextStroke = `${block.strokeWidth}px ${block.strokeColor || '#ffffff'}`;
  }

  return style;
}

export default function AdminSectionWrapper({ sectionId, children }: AdminSectionWrapperProps) {
  const {
    isAdmin, selectedSection, setSelectedSection, siteContent,
    updateCustomTextBlock, updateCustomShape,
  } = useAdmin();

  const isSelected = selectedSection === sectionId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; type: 'text' | 'shape'; action: 'move' | 'scale'; startX: number; startY: number; origX: number; origY: number; origScale?: number; origWidth?: number; origHeight?: number } | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isAdmin) return;
    // Don't select if we just finished dragging
    if (dragging) return;
    e.stopPropagation();
    setSelectedSection(isSelected ? null : sectionId);
  }, [isAdmin, isSelected, sectionId, setSelectedSection, dragging]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent, id: string, type: 'text' | 'shape', action: 'move' | 'scale', origX: number, origY: number, extras?: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ id, type, action, startX: e.clientX, startY: e.clientY, origX, origY, ...extras });
  }, []);

  useEffect(() => {
    if (!dragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = ((e.clientX - dragging.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragging.startY) / rect.height) * 100;

      if (dragging.action === 'move') {
        // Snap to 5% grid
        let newX = Math.max(0, Math.min(100, dragging.origX + deltaX));
        let newY = Math.max(0, Math.min(100, dragging.origY + deltaY));
        newX = Math.round(newX / 5) * 5;
        newY = Math.round(newY / 5) * 5;

        if (dragging.type === 'text') {
          updateCustomTextBlock(dragging.id, { x: newX, y: newY });
        } else {
          updateCustomShape(dragging.id, { x: newX, y: newY });
        }
      } else if (dragging.action === 'scale') {
        if (dragging.type === 'text') {
          // Scale text block (1 unit per 100px dragged)
          const scaleDelta = (e.clientX - dragging.startX) / 100;
          const newScale = Math.max(0.1, (dragging.origScale || 1) + scaleDelta);
          updateCustomTextBlock(dragging.id, { scale: Number(newScale.toFixed(2)) });
        } else {
          // Scale shape width and height
          const newW = Math.max(10, (dragging.origWidth || 100) + (e.clientX - dragging.startX));
          const newH = Math.max(10, (dragging.origHeight || 100) + (e.clientY - dragging.startY));
          updateCustomShape(dragging.id, { width: Math.round(newW), height: Math.round(newH) });
        }
      }
    };

    const handleMouseUp = () => {
      // Small timeout so the click handler doesn't fire
      setTimeout(() => setDragging(null), 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, updateCustomTextBlock, updateCustomShape]);

  // Data
  const textBlocks = (siteContent.customTextBlocks || []).filter(b => b.section === sectionId);
  const shapes = (siteContent.customShapes || []).filter(s => s.section === sectionId);
  const sectionDesign = siteContent.sectionDesigns?.[sectionId];

  // Inject keyframe styles for animations
  const animStyles = textBlocks
    .filter(b => b.animation !== 'none' && ANIMATION_KEYFRAMES[b.animation])
    .map(b => `@keyframes anim-${b.id} { ${ANIMATION_KEYFRAMES[b.animation]} }`)
    .join('\n');

  // Render custom code as sandboxed iframe
  const customCodeHtml = sectionDesign?.customCode || '';

  // Non-admin view
  if (!isAdmin) {
    return (
      <div className="relative overflow-hidden" ref={containerRef}>
        {animStyles && <style dangerouslySetInnerHTML={{ __html: animStyles }} />}
        {sectionDesign?.backgroundGradient && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(${sectionDesign.backgroundGradient.direction || 'to bottom'}, ${sectionDesign.backgroundGradient.color1}, ${sectionDesign.backgroundGradient.color2})`,
            opacity: sectionDesign.backgroundGradient.opacity ?? 0.5,
          }} />
        )}
        {sectionDesign?.backgroundImage?.url && (
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `url(${sectionDesign.backgroundImage.url})`,
            backgroundSize: sectionDesign.backgroundImage.size || 'cover',
            backgroundPosition: sectionDesign.backgroundImage.position || 'center',
            opacity: sectionDesign.backgroundImage.opacity ?? 0.3,
            filter: sectionDesign.backgroundImage.blur ? `blur(${sectionDesign.backgroundImage.blur}px)` : undefined,
            mixBlendMode: (sectionDesign.backgroundImage.blendMode as React.CSSProperties['mixBlendMode']) || 'normal',
          }} />
        )}
        {customCodeHtml && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" dangerouslySetInnerHTML={{ __html: customCodeHtml }} />
        )}
        {children}
        {textBlocks.map(block => (
          <div
            key={block.id}
            className="pointer-events-none"
            style={{
              ...getTextStyle(block),
              animation: block.animation !== 'none'
                ? `anim-${block.id} ${block.animationDuration || 0.6}s ${block.animationEasing || 'ease-out'} ${block.animationDelay || 0}s both`
                : undefined,
            }}
          >
            {block.content}
          </div>
        ))}
        {shapes.map(shape => (
          <div
            key={shape.id}
            className="absolute pointer-events-none"
            style={{
              left: `${shape.x}%`, top: `${shape.y}%`,
              width: `${shape.width}px`, height: `${shape.height}px`,
              transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
              backgroundColor: shape.fillColor,
              borderColor: shape.borderColor,
              borderWidth: shape.borderWidth > 0 ? `${shape.borderWidth}px` : undefined,
              borderStyle: shape.borderWidth > 0 ? 'solid' : 'none',
              borderRadius: shape.type === 'circle' ? '50%' : `${shape.borderRadius}px`,
              opacity: shape.opacity, zIndex: shape.zIndex,
            }}
          />
        ))}
      </div>
    );
  }

  // Admin view
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-background'
          : 'hover:ring-1 hover:ring-cyan-400/40 hover:ring-offset-1 hover:ring-offset-background'
      }`}
      onClick={handleClick}
      style={{ cursor: dragging ? 'grabbing' : 'pointer' }}
    >
      {animStyles && <style dangerouslySetInnerHTML={{ __html: animStyles }} />}

      {/* Section label */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-[100] bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          {sectionId}
        </div>
      )}

      {/* Section design overlays */}
      {sectionDesign?.backgroundGradient && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(${sectionDesign.backgroundGradient.direction || 'to bottom'}, ${sectionDesign.backgroundGradient.color1}, ${sectionDesign.backgroundGradient.color2})`,
          opacity: sectionDesign.backgroundGradient.opacity ?? 0.5,
        }} />
      )}
      {sectionDesign?.backgroundImage?.url && (
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url(${sectionDesign.backgroundImage.url})`,
          backgroundSize: sectionDesign.backgroundImage.size || 'cover',
          backgroundPosition: sectionDesign.backgroundImage.position || 'center',
          opacity: sectionDesign.backgroundImage.opacity ?? 0.3,
          filter: sectionDesign.backgroundImage.blur ? `blur(${sectionDesign.backgroundImage.blur}px)` : undefined,
          mixBlendMode: (sectionDesign.backgroundImage.blendMode as React.CSSProperties['mixBlendMode']) || 'normal',
        }} />
      )}
      {customCodeHtml && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" dangerouslySetInnerHTML={{ __html: customCodeHtml }} />
      )}

      {children}

      {/* Draggable text blocks */}
      {textBlocks.map(block => (
        <div
          key={block.id}
          className={`group cursor-grab active:cursor-grabbing border border-dashed ${
            dragging?.id === block.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-cyan-400/30 hover:border-cyan-400'
          }`}
          style={{
            ...getTextStyle(block),
            padding: '4px 8px',
            animation: block.animation !== 'none'
              ? `anim-${block.id} ${block.animationDuration || 0.6}s ${block.animationEasing || 'ease-out'} ${block.animationDelay || 0}s both`
              : undefined,
          }}
          onMouseDown={e => handleDragStart(e, block.id, 'text', 'move', block.x, block.y)}
        >
          {block.content}
          
          {/* Resize Handle */}
          <div 
            className={`absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full cursor-nwse-resize opacity-0 transition-opacity ${dragging?.id === block.id ? 'opacity-100' : 'group-hover:opacity-100 hover:opacity-100'}`}
            onMouseDown={e => handleDragStart(e, block.id, 'text', 'scale', block.x, block.y, { origScale: block.scale })}
          />
        </div>
      ))}

      {/* Draggable shapes */}
      {shapes.map(shape => (
        <div
          key={shape.id}
          className={`group absolute cursor-grab active:cursor-grabbing border border-dashed ${
            dragging?.id === shape.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-cyan-400/30 hover:border-cyan-400'
          }`}
          style={{
            left: `${shape.x}%`, top: `${shape.y}%`,
            width: `${shape.width}px`, height: `${shape.height}px`,
            transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
            backgroundColor: shape.fillColor,
            borderRadius: shape.type === 'circle' ? '50%' : `${shape.borderRadius}px`,
            opacity: shape.opacity, zIndex: shape.zIndex,
          }}
          onMouseDown={e => handleDragStart(e, shape.id, 'shape', 'move', shape.x, shape.y)}
        >
          {/* Resize Handle */}
          <div 
            className={`absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full cursor-nwse-resize opacity-0 transition-opacity ${dragging?.id === shape.id ? 'opacity-100' : 'group-hover:opacity-100 hover:opacity-100'}`}
            onMouseDown={e => handleDragStart(e, shape.id, 'shape', 'scale', shape.x, shape.y, { origWidth: shape.width, origHeight: shape.height })}
          />
        </div>
      ))}
    </div>
  );
}
