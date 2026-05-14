'use client';


import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  url: string;
  name: string;
  type: 'image' | 'video' | '3d';
  isNew?: boolean;
  isRenaming?: boolean;
}

export default function TestUpload() {
  const { isAdmin } = useAdmin();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load previously uploaded files on component mount
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch the list of files from your API
      // For now, we'll just use the files from state
    } catch (err: unknown) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle file rename
  const promptForRename = (currentName: string): Promise<string> => {
    return new Promise((resolve) => {
      const newName = prompt('Enter a new name for the file (with extension):', currentName);
      if (newName && newName !== currentName) {
        resolve(newName);
      } else {
        resolve(currentName);
      }
    });
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Ask for new name before upload if in admin mode
      let fileName = file.name;
      if (isAdmin) {
        const newName = await promptForRename(file.name);
        if (!newName) {
          setUploading(false);
          return; // User cancelled
        }
        fileName = newName;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads');
      if (isAdmin) {
        formData.append('fileName', fileName);
      }

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Determine file type
      let fileType: 'image' | 'video' | '3d' = 'image';
      if (file.type.startsWith('video/')) {
        fileType = 'video';
      } else if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        fileType = '3d';
      }

      // Add the new file to our list
      setFiles(prev => [
        {
          url: data.url || `https://storage.googleapis.com/${data.bucket}/${data.name}`,
          name: data.name?.split('/').pop() || fileName,
          type: fileType,
          isNew: true
        },
        ...prev
      ]);

    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Handle file rename
  const handleRename = async (oldUrl: string, currentName: string) => {
    try {
      // Get the file extension from the current name
      const fileExt = currentName.split('.').pop();

      // Prompt for new name, pre-filling with the current name without extension
      const currentNameWithoutExt = currentName.includes('.')
        ? currentName.substring(0, currentName.lastIndexOf('.'))
        : currentName;

      const newNameInput = prompt('Enter a new name for the file:', currentNameWithoutExt);

      // If user cancels or enters the same name, do nothing
      if (!newNameInput || newNameInput === currentNameWithoutExt) return false;

      // Preserve the original file extension
      const newName = newNameInput.includes('.')
        ? newNameInput
        : `${newNameInput}.${fileExt}`;

      // Show loading state
      setFiles(prev =>
        prev.map(file =>
          file.url === oldUrl
            ? { ...file, isRenaming: true }
            : file
        )
      );

      // Extract the path from the URL
      const url = new URL(oldUrl);
      const path = decodeURIComponent(url.pathname.substring(1)); // Remove leading slash

      // Call the rename API
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPath: path,
          newName: newName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rename failed');
      }

      // Update the file in our list with the new URL and name
      setFiles(prev =>
        prev.map(file =>
          file.url === oldUrl
            ? {
              ...file,
              url: data.url || oldUrl,
              name: data.name || newName,
              isNew: false,
              isRenaming: false
            }
            : file
        )
      );

      return true;
    } catch (err) {
      console.error('Rename error:', err);

      // Reset the renaming state on error
      setFiles(prev =>
        prev.map(file =>
          file.url === oldUrl
            ? { ...file, isRenaming: false }
            : file
        )
      );

      alert(`Failed to rename file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  // Handle file delete
  const handleDelete = async (url: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return false;
    }

    try {
      // In a real app, you would call your API to delete the file
      // For now, we'll just remove it from the local state
      setFiles(prev => prev.filter(file => file.url !== url));
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">File Manager</h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="font-semibold text-blue-800 mb-2">Upload Files</h2>
            <p className="text-sm text-blue-700 mb-4">
              Upload images or videos to your Google Cloud Storage bucket.
              {isAdmin && ' You can rename files by clicking the edit icon.'}
            </p>

            <div className="flex items-center">
              <label className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.glb,.gltf"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  className={`flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Select File'}
                </Button>
              </label>

              {uploading && (
                <span className="ml-4 text-sm text-gray-600">Uploading, please wait...</span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {loading ? 'Loading...' : 'Your Files'}
            </h2>

            {files.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No files uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                  <div key={file.url} className={`relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${file.isNew ? 'ring-2 ring-green-500' : ''} ${file.isRenaming ? 'opacity-70' : ''}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {file.isRenaming ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center">
                        {file.type === 'image' ? (
                          <Image
                            src={file.url}
                            alt={file.name}
                            fill
                            unoptimized
                            className={`object-contain ${file.isRenaming ? 'opacity-50' : ''}`}
                          />
                        ) : file.type === 'video' ? (
                          <video
                            src={file.url}
                            controls
                            className={`max-w-full max-h-full ${file.isRenaming ? 'opacity-50' : ''}`}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="text-4xl mb-2">🧊</div>
                            <span className="text-xs text-gray-500">{file.name}</span>
                          </div>
                        )}
                      </div>

                      {isAdmin && !file.isRenaming && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(file.url, file.name);
                            }}
                            className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Rename file"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.url);
                            }}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete file"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                            title={file.name}
                            onClick={() => handleRename(file.url, file.name)}
                          >
                            {file.isRenaming ? 'Renaming...' : file.name}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full ml-2 flex-shrink-0">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
