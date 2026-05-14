
"use client";

import type { ChangeEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import { GraduationCap, MapPin, Briefcase, ListChecks, UploadCloud } from 'lucide-react';
import MediaDisplay from '@/components/ui/media-display';
import ScrollAnimationWrapper from '@/components/scroll-animation-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import EditableTextInline from '@/components/editable-text-inline';
import DraggableNativeElement from '@/components/admin/draggable-native-element';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import type { SiteContent } from '@/types/content';

const staticInfoItemsData = [
  { icon: <GraduationCap className="h-5 w-5 text-primary-foreground" />, titleKey: 'aboutInfoEducationTitle' as keyof SiteContent, valueKey: 'aboutInfoEducationValue' as keyof SiteContent },
  { icon: <MapPin className="h-5 w-5 text-primary-foreground" />, titleKey: 'aboutInfoLocationTitle' as keyof SiteContent, valueKey: 'aboutInfoLocationValue' as keyof SiteContent },
  { icon: <Briefcase className="h-5 w-5 text-primary-foreground" />, titleKey: 'aboutInfoExperienceTitle' as keyof SiteContent, valueKey: 'aboutInfoExperienceValue' as keyof SiteContent },
  { icon: <ListChecks className="h-5 w-5 text-primary-foreground" />, titleKey: 'aboutInfoProjectsCompletedTitle' as keyof SiteContent, valueKey: 'aboutInfoProjectsCompletedValue' as keyof SiteContent },
];

type MediaType = 'image' | 'video' | null;

export default function AboutSection() {
  const { isAdmin, hasMounted, siteContent, updateSiteContent } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Get media source and type from site content with defaults
  const mediaSrc = siteContent.aboutMediaSrc || 'https://placehold.co/600x800.png';
  const mediaType = siteContent.aboutMediaType || 'image';

  // Use useEffect to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUploading && uploadProgress < 90) {
      timer = setInterval(() => {
        setUploadProgress(prevProgress => Math.min(prevProgress + 5, 90));
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isUploading, uploadProgress]);

  const handleMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    // The filename is generated on the server side
    let newMediaType: MediaType = null;

    if (file.type.startsWith('image/')) {
      newMediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      newMediaType = 'video';
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image or video file."
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Direct upload to API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'about_media');
      formData.append('fileName', `${Date.now()}_${file.name.replace(/\s+/g, '_')}`);

      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 90);
            setUploadProgress(progress);
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);

              if (response.success) {
                // Update site content with the new URL
                updateSiteContent('aboutMediaSrc', response.url);
                updateSiteContent('aboutMediaType', newMediaType);
                setUploadProgress(100);

                toast({
                  title: "Success",
                  description: "About section media updated successfully."
                });
                resolve();
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (error) {
              console.error('Error parsing response:', error);
              reject(new Error('Failed to process upload response'));
            }
          } else {
            console.error('Upload failed with status:', xhr.status, xhr.statusText);
            console.error('Response:', xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          console.error('Upload error:', xhr.statusText);
          reject(new Error('Network error during upload'));
        };

        xhr.open('POST', '/api/upload', true);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Could not upload media.",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };



  return (
    <section id="about" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 relative">
        <ScrollAnimationWrapper className="text-center mb-16 relative min-h-[150px]">
          <DraggableNativeElement id="aboutTitleWrapper_canvas" label="About Title" section="about" defaultX={50} defaultY={0} defaultZ={10}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline inline-block">
              <EditableTextInline contentKey="aboutSectionTitle" as="span">
                {siteContent.aboutSectionTitle}
              </EditableTextInline>
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </DraggableNativeElement>
        </ScrollAnimationWrapper>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <ScrollAnimationWrapper className="md:w-2/5 mb-10 md:mb-0 relative min-h-[500px]">
            <DraggableNativeElement id="aboutMediaWrapper_canvas" label="About Media" section="about" defaultX={0} defaultY={0} defaultZ={10}>
              <div className="relative group bg-gradient-to-br from-primary to-accent p-1 rounded-xl shadow-lg">
                <div className="bg-card rounded-lg p-1 h-full">
                  <MediaDisplay
                    src={mediaSrc}
                    type={mediaType as 'image' | 'video'}
                    alt={siteContent.aboutCraftingTitle || "About me"}
                    width={600}
                    height={800}
                  />
                </div>
              {isClient && hasMounted && isAdmin && (
                <div className="absolute top-2 right-2 z-10">
                  {!isUploading ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      className="opacity-80 group-hover:opacity-100 transition-opacity bg-card/70 hover:bg-card"
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Change Media
                    </Button>
                  ) : (
                    <div className="bg-card/90 p-2 rounded-md shadow-lg w-40">
                      <Progress value={uploadProgress} className="h-2.5" />
                      <p className="text-xs text-center text-muted-foreground mt-1">{uploadProgress === 100 ? "Complete!" : `Uploading...`}</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaChange}
                    className="hidden"
                    accept="image/*,video/*"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>
            </DraggableNativeElement>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper className="md:w-1/2 relative min-h-[500px]">
            <DraggableNativeElement id="aboutCraftingTitleWrapper_canvas" label="About Subtitle" section="about" defaultX={0} defaultY={0} defaultZ={10}>
              <EditableTextInline
                contentKey="aboutCraftingTitle"
                as="h2"
                className="text-2xl font-bold mb-6 text-foreground font-headline block"
              >
                {siteContent.aboutCraftingTitle}
              </EditableTextInline>
            </DraggableNativeElement>
            
            <DraggableNativeElement id="aboutParagraphsWrapper_canvas" label="About Description" section="about" defaultX={0} defaultY={25} defaultZ={10}>
              <div className="text-muted-foreground mb-6">
                <EditableTextInline contentKey="aboutParagraph1" as="textarea">
                  {siteContent.aboutParagraph1}
                </EditableTextInline>
              </div>
              <div className="text-muted-foreground mb-6">
                <EditableTextInline contentKey="aboutParagraph2" as="textarea">
                  {siteContent.aboutParagraph2}
                </EditableTextInline>
              </div>
            </DraggableNativeElement>

            <DraggableNativeElement id="aboutInfoBoxesWrapper_canvas" label="About Info Boxes" section="about" defaultX={0} defaultY={75} defaultZ={10}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {staticInfoItemsData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-background/50 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      <EditableTextInline contentKey={item.titleKey} as="span">
                        {siteContent[item.titleKey] as string}
                      </EditableTextInline>
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      <EditableTextInline contentKey={item.valueKey} as="span" inputClassName="text-sm">
                        {siteContent[item.valueKey] as string}
                      </EditableTextInline>
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </DraggableNativeElement>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
}