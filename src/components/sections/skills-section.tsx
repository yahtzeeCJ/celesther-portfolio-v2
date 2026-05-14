
"use client";

import { useState, useRef, useEffect } from 'react';
import { Film, Box, Laptop, Video, Image as ImageIcon, Trash2, PlusCircle, Move, Upload, RotateCw } from 'lucide-react';
import AnimatedProgressBar from '@/components/animated-progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ScrollAnimationWrapper from '@/components/scroll-animation-wrapper';
import EditableTextInline from '@/components/editable-text-inline';
import { useAdmin } from '@/contexts/AdminContext';
import type { SkillCategory, TechProficiency } from '@/types/content';

const iconMap: { [key: string]: React.ReactElement } = {
  Film: <Film className="h-8 w-8 text-primary-foreground" />,
  Box: <Box className="h-8 w-8 text-primary-foreground" />,
  Laptop: <Laptop className="h-8 w-8 text-primary-foreground" />,
};

const techIconMap: { [key: string]: React.ReactElement } = {
  Film: <Film className="h-10 w-10 text-primary" />,
  Video: <Video className="h-10 w-10 text-primary" />,
  ImageIcon: <ImageIcon className="h-10 w-10 text-primary" />,
  Box: <Box className="h-10 w-10 text-primary" />,
};

// 3D Object Placeholder Component
const ObjectPlaceholder3D = ({ 
  category, 
  isAdmin, 
  updateSkillCategory 
}: { 
  category: SkillCategory;
  isAdmin: boolean;
  updateSkillCategory: (id: string, updates: Partial<SkillCategory>) => void;
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // We only need to track scroll if we are rendering the CSS placeholder
    if (category.model3dUrl) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalDistance = windowHeight + rect.height;
      const currentDistance = windowHeight - rect.top;
      
      let progress = 0;
      if (currentDistance > 0 && currentDistance < totalDistance) {
        progress = currentDistance / totalDistance;
      } else if (currentDistance >= totalDistance) {
        progress = 1;
      }
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [category.model3dUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '3d-models');

    try {
      toast({ title: 'Uploading...', description: 'Your 3D model is being uploaded to storage.' });
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        updateSkillCategory(category.id, { model3dUrl: data.url });
        toast({ title: 'Success', description: '3D Model attached successfully.' });
      } else {
        toast({ title: 'Upload failed', description: data.error || 'Server rejected file.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload error', description: String(error), variant: 'destructive' });
    }
  };

  // Calculate the spread for the merging/shattering animation.
  // 0 at edges, max at center (progress 0.5)
  const spread = (0.5 - Math.abs(0.5 - scrollProgress)) * 500;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center bg-card/30 border border-border/50 rounded-xl relative overflow-hidden group">
      {isAdmin && (
        <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-2 rounded-lg border border-border shadow-xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase whitespace-nowrap text-muted-foreground">3D Model URL (.glb)</label>
            <Input 
              value={category.model3dUrl || ''} 
              onChange={(e) => updateSkillCategory(category.id, { model3dUrl: e.target.value })}
              placeholder="https://.../model.glb"
              className="h-6 w-32 text-xs bg-background"
            />
            <input 
              type="file" 
              accept=".glb,.gltf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUpload}
            />
            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => fileInputRef.current?.click()} title="Upload Local File">
              <Upload className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 mt-1">
            <div className="flex items-center gap-2">
              <RotateCw className="h-3 w-3 text-muted-foreground" />
              <label className="text-[10px] font-bold uppercase">Auto Rotate</label>
            </div>
            <Switch 
              checked={category.model3dAutoRotate ?? true} 
              onCheckedChange={(checked) => updateSkillCategory(category.id, { model3dAutoRotate: checked })}
            />
          </div>
        </div>
      )}

      {category.model3dUrl ? (
        // @ts-expect-error - model-viewer is a web component
        <model-viewer 
          src={category.model3dUrl} 
          auto-rotate={category.model3dAutoRotate !== false ? true : undefined} 
          camera-controls 
          shadow-intensity="1" 
          style={{ width: '100%', height: '100%', minHeight: '300px' }}
        ></model-viewer>
      ) : (
        <>
          {/* Simulating a 3D environment look */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Morphing placeholder that shatters/merges on scroll */}
            <div className={`w-32 h-32 relative preserve-3d ${category.model3dAutoRotate !== false ? 'animate-[spin_10s_linear_infinite]' : ''} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}>
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `translateZ(${64 + spread}px)` }} />
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `rotateY(180deg) translateZ(${64 + spread}px)` }} />
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `rotateY(90deg) translateZ(${64 + spread}px)` }} />
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `rotateY(-90deg) translateZ(${64 + spread}px)` }} />
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `rotateX(90deg) translateZ(${64 + spread}px)` }} />
              <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10 transition-transform duration-75" style={{ transform: `rotateX(-90deg) translateZ(${64 + spread}px)` }} />
              
              {/* Inner core that grows as outer shell expands */}
              <div className="absolute inset-0 m-auto w-16 h-16 bg-cyan-400/20 blur-md rounded-full shadow-[0_0_30px_#22d3ee] transition-transform duration-75" style={{ transform: `scale(${1 + scrollProgress * 2})` }} />
            </div>
          </div>
          <div className="relative z-10 text-center pointer-events-none">
            <h4 className="text-xl font-bold font-headline text-cyan-400 tracking-wider mb-2">3D Object Placeholder</h4>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">{category.title}</p>
          </div>
        </>
      )}
    </div>
  );
};

const SNAP_GRID = 20;

export default function SkillsSection() {
  const { isAdmin, hasMounted, siteContent, updateSkillCategory, addSkillCategory, deleteSkillCategory, updateTechProficiency, addTechProficiency, deleteTechProficiency } = useAdmin();

  const [draggingCard, setDraggingCard] = useState<{ id: string, type: 'move' | 'scale' } | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0, origTx: 0, origTy: 0, origScale: 1 });

  const handleDragStart = (e: React.MouseEvent, category: SkillCategory, type: 'move' | 'scale') => {
    if (!isAdmin) return;
    e.preventDefault();
    setDraggingCard({ id: category.id, type });
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      origTx: category.transformX || 0,
      origTy: category.transformY || 0,
      origScale: category.scale || 1
    };
  };

  useEffect(() => {
    if (!draggingCard) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      if (draggingCard.type === 'move') {
        // Snap to grid
        const snappedTx = Math.round((dragStartPos.current.origTx + deltaX) / SNAP_GRID) * SNAP_GRID;
        const snappedTy = Math.round((dragStartPos.current.origTy + deltaY) / SNAP_GRID) * SNAP_GRID;

        updateSkillCategory(draggingCard.id, {
          transformX: snappedTx,
          transformY: snappedTy
        });
      } else if (draggingCard.type === 'scale') {
        const scaleDelta = deltaX / 200; // 1 unit per 200px
        const newScale = Math.max(0.5, Math.min(3, dragStartPos.current.origScale + scaleDelta));
        updateSkillCategory(draggingCard.id, {
          scale: Number(newScale.toFixed(2))
        });
      }
    };

    const handleMouseUp = () => setDraggingCard(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingCard, updateSkillCategory]);

  return (
    <section id="skills" className="py-20 overflow-hidden relative">
      <div className="container mx-auto px-4">
        <ScrollAnimationWrapper className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">
            <EditableTextInline contentKey="skillsSectionTitle" as="span">
              {siteContent.skillsSectionTitle}
            </EditableTextInline>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <EditableTextInline contentKey="skillsSectionDescription" as="span" inputClassName="text-muted-foreground">
              {siteContent.skillsSectionDescription}
            </EditableTextInline>
          </p>
          <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
        </ScrollAnimationWrapper>

        {hasMounted && isAdmin && (
          <div className="text-center mb-12 relative z-50">
            <Button onClick={addSkillCategory}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Skill Category
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Boxes snap to a 20px grid when dragged.</p>
          </div>
        )}

        <div className="flex flex-col gap-16 mb-24 relative">
          {siteContent.skillCategories.map((category: SkillCategory) => (
            <div key={category.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch relative" style={{ zIndex: category.zIndex || 1 }}>
              
              {/* Left Column: Info Card */}
              <div className="relative z-10 flex flex-col justify-center" style={{
                transform: `translate(${category.transformX || 0}px, ${category.transformY || 0}px) scale(${category.scale || 1})`,
                transition: draggingCard?.id === category.id && draggingCard.type === 'move' ? 'none' : 'transform 0.1s ease-out'
              }}>
                <ScrollAnimationWrapper className="h-full w-full">
                  <Card className="h-full bg-card/80 border-border shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 relative group">
                    {/* Admin Controls */}
                    {hasMounted && isAdmin && (
                      <div className="absolute -top-4 -left-4 right-2 z-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-2 rounded-lg border border-border shadow-xl">
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1 bg-muted rounded hover:bg-muted/80 text-foreground"
                          onMouseDown={(e) => handleDragStart(e, category, 'move')}
                          title="Drag to move (Snaps to Grid)"
                        >
                          <Move className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase">Scale</label>
                          <Input 
                            type="number" 
                            step={0.1} 
                            min={0.5} 
                            max={3} 
                            value={category.scale || 1} 
                            onChange={(e) => updateSkillCategory(category.id, { scale: Number(e.target.value) })}
                            className="h-6 w-16 text-xs"
                            title="Scale snaps in 0.1 increments"
                          />
                          <Button variant="destructive" size="icon" onClick={() => deleteSkillCategory(category.id)} className="h-6 w-6 ml-2" title="Delete Category">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <CardHeader className="items-center text-center md:items-start md:text-left pt-8">
                      <div className="w-16 h-16 rounded-xl bg-primary mb-6 flex items-center justify-center">
                        {iconMap[category.icon] || <Laptop className="h-8 w-8 text-primary-foreground" />}
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground font-headline w-full">
                        {hasMounted && isAdmin ? <Input value={category.title} onChange={(e) => updateSkillCategory(category.id, { title: e.target.value })} className="text-xl font-bold p-0 border-none focus-visible:ring-0 bg-transparent h-auto" /> : category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground mb-6 text-sm">
                        {hasMounted && isAdmin ? <Textarea value={category.description} onChange={(e) => updateSkillCategory(category.id, { description: e.target.value })} rows={3} className="text-sm w-full bg-transparent border-border" /> : <p>{category.description}</p>}
                      </div>
                      <div className="space-y-4">
                        {category.skills.map((skill) => (
                          <AnimatedProgressBar
                            key={skill.id}
                            label={skill.name}
                            value={skill.level}
                          />
                        ))}
                      </div>
                    </CardContent>
                    
                    {/* Visual Resize Handle */}
                    {hasMounted && isAdmin && (
                      <div 
                        className={`absolute -bottom-3 -right-3 w-6 h-6 bg-cyan-400 rounded-full cursor-nwse-resize opacity-0 transition-opacity ${draggingCard?.id === category.id ? 'opacity-100' : 'group-hover:opacity-100 hover:opacity-100'} flex items-center justify-center shadow-lg border-2 border-background z-50`}
                        onMouseDown={(e) => handleDragStart(e, category, 'scale')}
                        title="Drag to scale"
                      >
                        <div className="w-2 h-2 bg-background rounded-full pointer-events-none" />
                      </div>
                    )}
                  </Card>
                </ScrollAnimationWrapper>
              </div>

              {/* Right Column: 3D Placeholder */}
              <div className="relative z-0 h-full flex flex-col justify-center">
                <ScrollAnimationWrapper className="h-full w-full">
                  <ObjectPlaceholder3D 
                    category={category} 
                    isAdmin={isAdmin} 
                    updateSkillCategory={updateSkillCategory} 
                  />
                </ScrollAnimationWrapper>
              </div>

            </div>
          ))}
        </div>

        <ScrollAnimationWrapper className="text-center mt-32 relative z-20">
          <h3 className="text-xl font-bold mb-8 font-headline">
            <EditableTextInline contentKey="skillsTechProficienciesTitle" as="span">
              {siteContent.skillsTechProficienciesTitle}
            </EditableTextInline>
          </h3>

          {hasMounted && isAdmin && (
            <div className="text-center mb-8">
              <Button onClick={addTechProficiency} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Tech Proficiency
              </Button>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {siteContent.techProficiencies.map((tech: TechProficiency) => (
              <div key={tech.id} className="relative group/tech flex flex-col items-center justify-center p-4 w-28 h-28 bg-card/80 border border-border rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300">
                {hasMounted && isAdmin && (
                  <Button variant="destructive" size="icon" onClick={() => deleteTechProficiency(tech.id)} className="absolute top-1 right-1 z-10 h-6 w-6 opacity-0 group-hover/tech:opacity-100 transition-opacity" title="Delete Proficiency">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                {techIconMap[tech.icon] || <Laptop className="h-10 w-10 text-primary" />}
                <div className="text-xs mt-2 text-muted-foreground text-center">
                  {hasMounted && isAdmin ? <Input value={tech.name} onChange={(e) => updateTechProficiency(tech.id, { name: e.target.value })} className="text-xs p-0 border-none focus-visible:ring-0 bg-transparent h-auto text-center w-full" /> : <span>{tech.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
