
"use client";

import type { ChangeEvent, DragEvent } from 'react';
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { CloudUpload, Info, X, Shield, Image as ImageIcon, Video as VideoIcon, FileText, CheckCircle2, Eye, Play, Loader2, Trash2, Box, Pencil } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useAdmin } from '@/contexts/AdminContext';
import { deleteFromR2, renameInR2 } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { FileRenameDialog } from '@/components/ui/file-rename-dialog';
import dynamic from 'next/dynamic';

const ModelViewerWrapper = dynamic(() => import('@/components/model-viewer-wrapper'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center bg-muted rounded-lg h-[200px] sm:h-[300px] md:h-[400px] w-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading 3D Viewer...</p></div>,
});

// Removed file size limit, but keeping track of the 5GB free tier

const MAX_FILE_SIZE_DISPLAY = "5GB (Free Tier Limit)";
const SUPPORTED_FORMATS = ".mp4,.mov,.avi,.mkv,.jpg,.jpeg,.png,.gif,.webp,.glb,.gltf,.obj,.stl,.dae";
const SUPPORTED_MIMES = [
  "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "model/gltf-binary", "model/gltf+json", "model/obj", "model/stl", "model/vnd.collada+xml",
  "application/octet-stream"
];

interface StagedFile extends File {
  previewUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
  id: string;
}

interface UploadedMediaItem {
  url: string;
  name?: string;
  type?: string;
  id: string;
}

function MediaUploadPageComponent() {
  const { isAdmin, hasMounted, siteContent, updateProjectMediaUrls } = useAdmin();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [overallUploadProgress, setOverallUploadProgress] = useState(0);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<{ url: string, name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectKeyFromQuery = searchParams.get('projectKey');
  const projectTitleFromQuery = searchParams.get('projectTitle');

  const currentProjectKey = projectKeyFromQuery || 'project1'; // Default if not provided
  const currentProjectTitle = projectTitleFromQuery || (siteContent[`${currentProjectKey}Title` as keyof typeof siteContent] as string) || "Selected Project";


  const loadUploadedMedia = useCallback(() => {
    if (!hasMounted) return;
    const mediaUrlsForProject = siteContent.projectMediaUrls?.[currentProjectKey] || [];
    setUploadedMedia(mediaUrlsForProject.map((url, index) => ({
      url,
      id: `uploaded-${currentProjectKey}-${url.substring(url.lastIndexOf('/') + 1)}-${index}`,
      name: url.substring(url.lastIndexOf('/') + 1),
      type: getFileTypeFromName(url.substring(url.lastIndexOf('/') + 1)),
    })));
  }, [siteContent.projectMediaUrls, currentProjectKey, hasMounted]);

  useEffect(() => {
    loadUploadedMedia();
  }, [loadUploadedMedia]);

  useEffect(() => {
    return () => {
      stagedFiles.forEach(file => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedFiles]);

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) return 'video/mp4';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image/jpeg';
    if (extension === 'glb') return 'model/gltf-binary';
    if (extension === 'gltf') return 'model/gltf+json';
    if (['obj', 'stl', 'dae'].includes(extension || '')) return `model/${extension}`; // Specific types for non-interactive placeholders
    return 'application/octet-stream';
  };


  const handleBrowseClick = () => fileInputRef.current?.click();

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: StagedFile[] = [];
    for (const file of Array.from(files)) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      // Check if the extension is in SUPPORTED_FORMATS
      const isSupportedExtension = SUPPORTED_FORMATS.split(',').includes(`.${fileExtension}`);
      // Check if the MIME type is in SUPPORTED_MIMES OR if it's an octet-stream for a supported extension (fallback for some OS)
      const isValidMime = SUPPORTED_MIMES.includes(file.type) ||
        (isSupportedExtension && (file.type === '' || file.type === 'application/octet-stream'));


      if (!isValidMime) {
        toast({ variant: "destructive", title: "Unsupported File", description: `${file.name} (type: ${file.type || 'unknown'}) is not a supported video, image, or 3D model type.` });
        continue;
      }
      // Removed file size check to allow any file size
      // Note: Google Cloud Storage has a 5TB per object limit, but you should monitor your 5GB free tier
      if (!stagedFiles.some(f => f.name === file.name && f.size === file.size)) {
        const fileWithPreview: StagedFile = Object.assign(file, {
          previewUrl: (file.type.startsWith('image/') || file.type.startsWith('video/')) ? URL.createObjectURL(file) : undefined,
          uploadProgress: 0,
          id: `staged-${file.name}-${Date.now()}`
        });
        newFiles.push(fileWithPreview);
      }
    }
    setStagedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => processFiles(event.target.files);
  const handleDrop = (e: DragEvent) => {
    preventDefaults(e);
    if (!isAdmin) return;
    setIsDraggingOver(false);
    processFiles(e.dataTransfer?.files);
  };

  const preventDefaults = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: DragEvent) => { preventDefaults(e); if (isAdmin) setIsDraggingOver(true); };
  const handleDragLeave = (e: DragEvent) => { preventDefaults(e); if (isAdmin) setIsDraggingOver(false); };
  const handleDragOver = (e: DragEvent) => { preventDefaults(e); if (isAdmin) setIsDraggingOver(true); };

  const deleteStagedFile = (idToDelete: string) => {
    const fileToDelete = stagedFiles.find(f => f.id === idToDelete);
    if (fileToDelete?.previewUrl) URL.revokeObjectURL(fileToDelete.previewUrl);
    setStagedFiles(files => files.filter(f => f.id !== idToDelete));
  };

  const handleDeleteUploadedMedia = async (urlToDelete: string) => {
    if (!isAdmin) return;
    setDeletingUrl(urlToDelete);
    try {
      const result = await deleteFromR2(urlToDelete);
      if (result.success) {
        const currentProjectUrls = siteContent.projectMediaUrls?.[currentProjectKey] || [];
        const updatedUrls = currentProjectUrls.filter(url => url !== urlToDelete);
        updateProjectMediaUrls(currentProjectKey, updatedUrls);
        toast({ title: "Media Deleted", description: "The media has been removed and this project has been updated." });
      } else {
        throw new Error(result.error || "Failed to delete from Cloudflare R2.");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Could not delete the media."
      });
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleRenameMedia = async (oldUrl: string, newName: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {


      // Call the rename function
      const result = await renameInR2(oldUrl, newName);

      if (result.success && result.newUrl) {
        // Update the project media URLs
        const currentProjectUrls = siteContent.projectMediaUrls?.[currentProjectKey] || [];
        const updatedUrls = currentProjectUrls.map(url =>
          url === oldUrl ? result.newUrl! : url
        );

        updateProjectMediaUrls(currentProjectKey, updatedUrls);

        // Update local state
        setUploadedMedia(prev =>
          prev.map(item =>
            item.url === oldUrl
              ? { ...item, url: result.newUrl!, name: `${newName}.${oldUrl.split('.').pop()}` }
              : item
          )
        );

        toast({
          title: "Media Renamed",
          description: "The media has been renamed successfully.",
        });

        return true;
      } else {
        throw new Error(result.error || "Failed to rename the file in Cloudflare R2.");
      }
    } catch (error) {
      console.error("Error renaming media:", error);
      toast({
        variant: "destructive",
        title: "Rename Failed",
        description: error instanceof Error ? error.message : "Could not rename the media.",
      });
      return false;
    } finally {

      setRenamingItem(null);
    }
  };

  const handleRenameRequest = (url: string, currentName: string) => {
    if (!isAdmin) return;
    console.log('Rename requested for:', url, 'with name:', currentName);
    // Remove the file extension for the input field
    const nameWithoutExt = currentName.includes('.')
      ? currentName.split('.').slice(0, -1).join('.')
      : currentName;
    console.log('Setting renamingItem to:', { url, name: nameWithoutExt });
    setRenamingItem({ url, name: nameWithoutExt });
  };


  const handleClearAllStaged = () => {
    stagedFiles.forEach(file => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    setStagedFiles([]);
  };

  const handleFileUpload = async (file: StagedFile): Promise<void> => {
    if (!isAdmin) return;

    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);

    // Update the staged file with initial progress and preview
    setStagedFiles(prev => prev.map(f =>
      f.id === file.id
        ? { ...f, uploadProgress: 1, uploadError: undefined, previewUrl }
        : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', currentProjectKey);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update progress to 100%
      setStagedFiles(prev => prev.map(f =>
        f.id === file.id
          ? { ...f, uploadProgress: 100 }
          : f
      ));

      // Add to uploaded media
      const newMediaItem = {
        url: result.url,
        name: file.name,
        type: file.type,
        id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      setUploadedMedia(prev => [...prev, newMediaItem]);

      // Update project media URLs in the database
      const currentProjectUrls = siteContent.projectMediaUrls?.[currentProjectKey] || [];
      if (result.url && !currentProjectUrls.includes(result.url)) {
        const updatedUrls = [...currentProjectUrls, result.url];
        updateProjectMediaUrls(currentProjectKey, updatedUrls);
      }

      // Remove the file from staged files after successful upload
      setStagedFiles(prev => prev.filter(f => f.id !== file.id));

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded successfully.`,
        variant: 'default',
      });

    } catch (error) {
      console.error('Upload error:', error);
      setStagedFiles(prev => prev.map(f =>
        f.id === file.id
          ? {
            ...f,
            uploadError: error instanceof Error ? error.message : 'Upload failed',
            uploadProgress: 0
          }
          : f
      ));

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });

      // Re-throw the error so it can be caught by the batch upload handler if needed
      throw error;
    } finally {
      // Clean up the preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const handleActualUpload = async () => {
    if (stagedFiles.length === 0) return;
    setIsBatchUploading(true);
    setOverallUploadProgress(0);

    const newlyUploadedUrls: string[] = [];
    const totalFiles = stagedFiles.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = stagedFiles[i];
      await handleFileUpload(file);
      setOverallUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    if (newlyUploadedUrls.length > 0) {
      const currentSiteUrls = siteContent.projectMediaUrls?.[currentProjectKey] || [];
      updateProjectMediaUrls(currentProjectKey, [...currentSiteUrls, ...newlyUploadedUrls]);
    }

    setStagedFiles(prev => prev.filter(f => f.uploadError || (f.uploadProgress !== undefined && f.uploadProgress < 100)));

    setIsBatchUploading(false);
    if (newlyUploadedUrls.length === totalFiles && totalFiles > 0) {
      toast({ title: "Batch Upload Complete", description: `${totalFiles} files successfully uploaded to '${currentProjectTitle}'. Remember to Save Changes.` });
    } else if (newlyUploadedUrls.length > 0) {
      toast({ title: "Batch Upload Partially Complete", description: `${newlyUploadedUrls.length} of ${totalFiles} files uploaded to '${currentProjectTitle}'. Review failures. Remember to Save Changes.` });
    } else if (totalFiles > 0) {
      toast({ variant: "destructive", title: "Batch Upload Failed", description: `No files were uploaded to '${currentProjectTitle}'.` });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMediaItemPreview = (item: StagedFile | UploadedMediaItem, isStagedItem: boolean) => {
    // For uploaded items, we might have both a clean URL and a signed URL
    const cleanUrl = isStagedItem
      ? (item as StagedFile).previewUrl
      : (item as UploadedMediaItem).url;

    // Use the signed URL if available, otherwise fall back to the clean URL
    const mediaUrl = (item as unknown as { signedUrl?: string }).signedUrl || cleanUrl;

    const name = item.name || 'Unnamed Media';
    const itemTypeGuess = getFileTypeFromName(name);
    const itemType = isStagedItem ? ((item as StagedFile).type || itemTypeGuess) : ((item as UploadedMediaItem).type || itemTypeGuess);

    const size = isStagedItem ? (item as StagedFile).size : undefined;
    const progress = isStagedItem ? (item as StagedFile).uploadProgress : undefined;
    const error = isStagedItem ? (item as StagedFile).uploadError : undefined;

    const fileExtension = name.split('.').pop()?.toLowerCase() || '';
    const isImage = itemType?.startsWith('image/');
    const isVideo = itemType?.startsWith('video/');
    // For 3D models, we'll rely on the Cloudinary URL for <model-viewer> for uploaded items
    const isGlbOrGltf = ['glb', 'gltf'].includes(fileExtension);
    const isOther3DModel = ['obj', 'stl', 'dae'].includes(fileExtension);

    let icon, previewHTML, itemCategory;

    if (isImage && cleanUrl) {
      icon = <ImageIcon className="text-primary h-6 w-6" />;
      previewHTML = <NextImage src={cleanUrl} alt={name} width={500} height={200} className="rounded max-h-[200px] w-full object-contain" />;
      itemCategory = 'Image';
    } else if (isVideo && mediaUrl) {
      icon = <VideoIcon className="text-primary h-6 w-6" />;
      previewHTML = (
        <div className="relative w-full h-[200px] bg-black rounded overflow-hidden">
          <video
            controls
            controlsList="nodownload"
            className="h-full w-full object-contain"
            preload="metadata"
            playsInline
          >
            <source src={mediaUrl} type={itemType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
      itemCategory = 'Video';
    } else if (isGlbOrGltf && (item as UploadedMediaItem).url) { // Only use ModelViewer for uploaded GLB/GLTF with a real URL
      const modelUrl = (item as UploadedMediaItem).url;
      icon = <Box className="text-primary h-6 w-6" />;
      previewHTML = (
        <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] relative">
          <ModelViewerWrapper
            src={modelUrl}
            alt={name}
            className="w-full h-full"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      );
      itemCategory = `3D Model (.${fileExtension})`;
    } else if (isOther3DModel || (isGlbOrGltf && isStagedItem)) { // Staged GLB/GLTF or other 3D models
      icon = <Box className="text-primary h-6 w-6" />;
      previewHTML = (
        <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-4 w-full min-h-[150px]">
          <Box className="h-12 w-12 text-primary/70" />
          <p className="text-muted-foreground text-sm text-center mt-2">{name}</p>
          <p className="text-muted-foreground text-xs text-center mt-1">
            {isGlbOrGltf ? "Interactive preview after upload." : "Interactive preview not available for this format. Use .glb or .gltf."}
          </p>
        </div>
      );
      itemCategory = `3D Model (.${fileExtension})`;
    }
    else {
      icon = <FileText className="text-primary h-6 w-6" />;
      previewHTML = <p className="text-muted-foreground text-sm py-4 text-center">No preview available for this file type.</p>;
      itemCategory = 'File';
    }

    const isCurrentlyDeleting = !isStagedItem && deletingUrl === (item as UploadedMediaItem).url;

    return (
      <div key={item.id} className="bg-card/50 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start shadow hover:-translate-y-0.5 transition-transform">
        <div className="flex-shrink-0 pt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="font-medium truncate max-w-xs sm:max-w-md md:max-w-lg">{name}</div>
              <div className="text-muted-foreground text-sm">
                {size ? `${formatFileSize(size)} • ` : ''}
                {itemCategory}
                {isStagedItem && !progress && !error && <span className="text-yellow-500 ml-2">(Staged)</span>}
              </div>
            </div>
            {hasMounted && isAdmin && (
              <div className="flex space-x-1">
                {!isStagedItem && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameRequest(
                        (item as UploadedMediaItem).url,
                        (item as UploadedMediaItem).name || (item as UploadedMediaItem).url.split('/').pop() || 'file'
                      );
                    }}
                    className="text-muted-foreground hover:text-primary h-8 w-8"
                    disabled={isBatchUploading}
                    title="Rename file"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isStagedItem) {
                      deleteStagedFile(item.id);
                    } else {
                      handleDeleteUploadedMedia((item as UploadedMediaItem).url);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                >
                  {isCurrentlyDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          {previewHTML && <div className="file-preview flex justify-center my-2 w-full">{previewHTML}</div>}
          {isStagedItem && progress !== undefined && progress > 0 && progress < 100 && !error && (
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center mt-1">{progress}% Uploading...</p>
            </div>
          )}
          {isStagedItem && progress === 100 && !error && (
            <p className="text-xs text-green-500 mt-1 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" />Uploaded (Pending Save)</p>
          )}
          {isStagedItem && error && (
            <p className="text-xs text-destructive mt-1">Error: {error}</p>
          )}
        </div>
      </div>
    );
  };

  // Add the FileRenameDialog component at the bottom of the component's JSX
  const renderRenameDialog = () => {
    return (
      <FileRenameDialog
        key={renamingItem?.url || 'dialog'}
        open={!!renamingItem}
        onOpenChange={(open) => {
          if (!open) {
            setRenamingItem(null);
          }
        }}
        currentPath={renamingItem?.url || ''}
        onRename={async (newName) => {
          if (!renamingItem) return false;
          if (newName === renamingItem.name) {
            setRenamingItem(null);
            return false;
          }
          return handleRenameMedia(renamingItem.url, newName);
        }}
      />
    );
  };

  if (!hasMounted) {
    return (
      <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-lg">Loading...</span></div>
    )
  }

  if (!currentProjectKey) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md text-center p-8">
          <Info className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Project Not Specified</CardTitle>
          <CardDescription className="mt-2">Please navigate to this page from a specific project.</CardDescription>
          <Button asChild variant="link" className="mt-6">
            <Link href="/#projects">Back to Projects</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            {isAdmin ? <CloudUpload className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
            {isAdmin ? `Manage Media for '${currentProjectTitle}'` : `Media for '${currentProjectTitle}'`}
          </h1>
          <p className="opacity-90 mt-2">
            {isAdmin ? `Upload, view, and manage media files for the '${currentProjectTitle}' project.` : `Viewing media files for '${currentProjectTitle}'.`}
          </p>
        </div>

        <div className="p-6">
          {isAdmin && (
            <>
              <div className="mb-8 text-center">
                <div className="bg-primary/10 text-primary inline-flex items-center gap-2 py-1 px-3 rounded-full text-sm mb-4">
                  <Info className="h-4 w-4" /> Max file size: {MAX_FILE_SIZE_DISPLAY} per file
                </div>
                <h2 className="text-xl font-semibold text-foreground">Add New Media</h2>
                <p className="text-muted-foreground mt-1">Supported: {SUPPORTED_FORMATS.split(',').slice(0, 6).join(', ')}, ... (.glb, .gltf for 3D preview)</p>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-8 transition-colors
                  ${isDraggingOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              >
                <CloudUpload className="text-primary h-12 w-12 mx-auto mb-4" />
                <input type="file" ref={fileInputRef} className="hidden" multiple accept={SUPPORTED_FORMATS} onChange={handleFileSelection} disabled={isBatchUploading} />
                <h3 className="text-lg font-medium text-foreground mb-2">Drag & drop files here</h3>
                <p className="text-muted-foreground text-sm mb-4">or</p>
                <Button onClick={handleBrowseClick} variant="default" disabled={isBatchUploading}>Browse Files</Button>
              </div>
            </>
          )}

          {stagedFiles.length > 0 && isAdmin && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Files Staged for Upload ({stagedFiles.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto p-1 mb-4">
                {stagedFiles.map(file => renderMediaItemPreview(file, true))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleActualUpload} disabled={isBatchUploading || stagedFiles.length === 0} className="bg-green-600 hover:bg-green-700 flex-1">
                  {isBatchUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  {isBatchUploading ? `Uploading... (${overallUploadProgress}%)` : `Start Upload (${stagedFiles.length})`}
                </Button>
                <Button onClick={handleClearAllStaged} variant="outline" className="flex-1" disabled={isBatchUploading}>
                  <X className="mr-2 h-4 w-4" /> Clear Staged
                </Button>
              </div>
              {isBatchUploading && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground text-sm font-medium">Overall Batch Progress:</span>
                    <span className="text-primary text-sm font-semibold">{overallUploadProgress}%</span>
                  </div>
                  <Progress value={overallUploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}

          {!isAdmin && uploadedMedia.length === 0 && (
            <div className="text-center my-12 p-8 bg-muted/30 rounded-lg">
              <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-3">No Media Yet</h2>
              <p className="text-muted-foreground">There are no media files uploaded for this project.</p>
            </div>
          )}

          <div className="my-8">
            <h3 className="text-lg font-semibold mb-3">
              {`Uploaded Media for '${currentProjectTitle}'`} ({uploadedMedia.length})
            </h3>
            {uploadedMedia.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                {uploadedMedia.map(item => renderMediaItemPreview(item, false))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isAdmin ? `No media uploaded yet for '${currentProjectTitle}'.` : `No media available for '${currentProjectTitle}'.`}
              </p>
            )}
          </div>

        </div>

        <div className="bg-card/50 px-6 py-4 text-center border-t border-border">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />Media files are securely stored on Cloudflare R2. Don&apos;t forget to &quot;Save Changes&quot; in the navbar to persist updates to your portfolio display.
          </p>
        </div>
      </div>
      <Button asChild variant="link" className="mt-8">
        <Link href="/#projects">Back to Projects</Link>
      </Button>

      {/* Render the rename dialog */}
      {renderRenameDialog()}
    </div>
  );
}

export default function MediaUploadPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-lg">Loading Project Media...</span></div>}>
      <MediaUploadPageComponent />
    </Suspense>
  );
}
