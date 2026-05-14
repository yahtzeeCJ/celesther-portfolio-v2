
"use client";

import * as React from 'react';
import type { ChangeEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, ExternalLink, ArrowRight, UploadCloud, Film, Box, ImageIcon as ImgIcon, Folder, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ScrollAnimationWrapper from '@/components/scroll-animation-wrapper';
import { useAdmin } from '@/contexts/AdminContext';
import type { Project } from '@/types/content';
// uploadToR2 imported for use in file upload handler
import { uploadToR2 } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { summarizeProject } from '@/ai/flows/project-description-generator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

// Map icon names from context to actual components
const iconMap: { [key: string]: React.ReactElement } = {
  Film: <Film />,
  Box: <Box />,
  ImageIcon: <ImgIcon />,
  Folder: <Folder />,
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { isAdmin, hasMounted, updateProject, deleteProject } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryKeywords, setSummaryKeywords] = useState('');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const actualImageUrl = project.bannerUrl;
  // actualIsPlaceholder computed but not currently displayed - may be used for UI enhancements
  const projectPlaceholderIcon = iconMap[project.imagePlaceholderIcon] || <Folder />;

  // Editable fields handlers
  const handleFieldChange = (field: keyof Project, value: Project[keyof Project]) => {
    updateProject(project.id, { [field]: value });
  };

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()));
  };

  // Image upload logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUploading && uploadProgress < 90) {
      timer = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 150);
    }
    return () => clearInterval(timer);
  }, [isUploading, uploadProgress]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      const response = await uploadToR2(base64data, `project_banners/${project.key}`);
      if (response.success && response.url) {
        updateProject(project.id, { bannerUrl: response.url });
        setUploadProgress(100);
        toast({ title: "Success", description: `${project.title} banner updated.` });
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Error", description: error instanceof Error ? error.message : "Could not upload image." });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => !isUploading && fileInputRef.current?.click();

  const handleGenerateDescription = async () => {
    if (!summaryKeywords) {
      toast({ variant: "destructive", title: "Keywords required", description: "Please enter some keywords to generate a description." });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeProject({ keywords: summaryKeywords, currentDescription: project.description });
      if (result.summary) {
        updateProject(project.id, { description: result.summary });
        toast({ title: "Description Generated!", description: "The project description has been updated with the AI summary." });
        setIsAiDialogOpen(false);
      } else {
        throw new Error("AI did not return a summary.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Generation Failed", description: "Could not generate a summary. Please try again." });
      console.error("AI Summary Error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };


  // Links
  const constructedProjectLink = project.isEnabled ? `/upload?projectKey=${project.key}&projectTitle=${encodeURIComponent(project.title)}` : "#";
  const projectLinkText = project.isEnabled ? "See project" : "Coming soon";

  if (!project) return null; // Render nothing if project somehow doesn't exist

  return (
    <ScrollAnimationWrapper className="h-full">
      <Card className="bg-card/80 rounded-xl overflow-hidden border-border shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group relative">
        {hasMounted && isAdmin && (
          <Button variant="destructive" size="icon" className="absolute top-2 left-2 z-20 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteProject(project.id)} title="Delete Project">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <div className="h-64 overflow-hidden relative">
          {/* Always show placeholder on server and initial client render */}
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-400 ${isClient && actualImageUrl ? 'hidden' : ''
            }`}>
            <span className="text-white font-medium text-4xl">{project.title[0]?.toUpperCase() || 'P'}</span>
          </div>

          {/* Only render image on client side after hydration */}
          {isClient && actualImageUrl && (
            <div className="w-full h-full">
              <Image
                src={actualImageUrl}
                alt={project.title}
                width={600}
                height={400}
                className="project-image w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                priority={false}
                loading="lazy"
                unoptimized
                onLoad={(e) => {
                  // Show the image once it's loaded
                  e.currentTarget.parentElement?.classList.remove('hidden');
                }}
                onError={(e) => {
                  // Hide the image if it fails to load
                  e.currentTarget.parentElement?.classList.add('hidden');
                }}
              />
            </div>
          )}
          {hasMounted && isAdmin && (
            <div className="absolute top-2 right-2 z-10">
              {!isUploading ? (
                <Button variant="outline" size="sm" onClick={triggerFileInput} className="opacity-0 group-hover:opacity-100 transition-opacity bg-card/70 hover:bg-card">
                  <UploadCloud className="mr-2 h-4 w-4" /> Change Banner
                </Button>
              ) : (
                <div className="bg-card/90 p-2 rounded-md shadow-lg w-40">
                  <Progress value={uploadProgress} className="h-2.5" />
                  <p className="text-xs text-center text-muted-foreground mt-1">{uploadProgress === 100 ? "Complete!" : `Uploading...`}</p>
                </div>
              )}
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={isUploading} />
            </div>
          )}
        </div>
        <CardHeader className="flex-grow">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-foreground mb-2 flex items-center font-headline">
              {React.cloneElement(projectPlaceholderIcon, { className: "w-5 h-5 text-primary mr-2" })}
              {hasMounted && isAdmin ? <Input value={project.title} onChange={(e) => handleFieldChange('title', e.target.value)} className="text-xl font-bold p-0 border-none focus-visible:ring-0 bg-transparent h-auto" /> : project.title}
            </CardTitle>
            <div className="flex space-x-2">
              {hasMounted && isAdmin ? <Input value={project.githubLink || ''} onChange={(e) => handleFieldChange('githubLink', e.target.value)} placeholder="GitHub URL" className="h-7 text-xs" /> : (project.githubLink && project.githubLink !== "#" && (
                <Link href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="GitHub repository"><Github className="h-5 w-5" /></Link>
              ))}
              {hasMounted && isAdmin ? <Input value={project.liveLink || ''} onChange={(e) => handleFieldChange('liveLink', e.target.value)} placeholder="Live URL" className="h-7 text-xs" /> : (project.liveLink && project.liveLink !== "#" && (
                <Link href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Live project"><ExternalLink className="h-5 w-5" /></Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {hasMounted && isAdmin ? <Input value={project.tags.join(', ')} onChange={handleTagsChange} placeholder="Tags, comma-separated" className="h-7 text-xs" /> : (project.tags.map((tag) => <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary text-xs">{tag}</Badge>))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow relative pb-12">
          {hasMounted && isAdmin ? (
            <Textarea value={project.description} onChange={(e) => handleFieldChange('description', e.target.value)} rows={4} className="text-muted-foreground text-sm" />
          ) : (
            <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
          )}

          {hasMounted && isAdmin && (
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="absolute bottom-1 right-1 h-7 text-xs">
                  <Sparkles className="mr-2 h-3 w-3" /> Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Project Description</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter a few keywords (e.g., &quot;retro UI, space theme, React&quot;) and Gemini will write a compelling summary for your project.</p>
                  <Input placeholder="Keywords..." value={summaryKeywords} onChange={(e) => setSummaryKeywords(e.target.value)} disabled={isSummarizing} />
                  <Textarea value={project.description} readOnly disabled rows={5} className="text-sm bg-muted" placeholder="Current description..." />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost" disabled={isSummarizing}>Cancel</Button></DialogClose>
                  <Button onClick={handleGenerateDescription} disabled={isSummarizing}>
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Link href={constructedProjectLink} className={`text-primary font-medium hover:text-accent transition group/link flex items-center text-sm ${!project.isEnabled ? "pointer-events-none opacity-70" : ""}`}>
            {projectLinkText} {project.isEnabled && <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />}
          </Link>
          {hasMounted && isAdmin && (
            <div className="flex items-center space-x-2">
              <Label htmlFor={`enable-switch-${project.id}`}>Enable</Label>
              <Switch id={`enable-switch-${project.id}`} checked={project.isEnabled} onCheckedChange={(checked) => handleFieldChange('isEnabled', checked)} />
            </div>
          )}
        </CardFooter>
      </Card>
    </ScrollAnimationWrapper>
  );
}
