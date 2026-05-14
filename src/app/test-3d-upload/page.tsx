'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ModelViewerWrapper from '@/components/model-viewer-wrapper';

export default function Test3DUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [environmentFile, setEnvironmentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [environmentUrl, setEnvironmentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingEnv, setIsUploadingEnv] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflectionSettings, setReflectionSettings] = useState({
    exposure: 1,
    shadowIntensity: 1,
    shadowSoftness: 1,
    autoRotate: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setEnvironmentFile(selectedFile);
      setEnvironmentUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadEnvironment = async () => {
    if (!environmentFile) return;

    setIsUploadingEnv(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', environmentFile);
      formData.append('folder', 'environment-maps');

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload environment map');
      }

      console.log('Environment map uploaded:', result);
      setEnvironmentUrl(result.url);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload environment map';
      setError(errorMessage);
    } finally {
      setIsUploadingEnv(false);
    }
  };

  const handleSettingChange = (key: keyof typeof reflectionSettings, value: number | boolean) => {
    setReflectionSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '3d-models');

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      console.log('Upload successful:', result);
      setPreviewUrl(result.url);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">3D Model Upload Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              3D Model (GLB/GLTF):
            </label>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90 mb-2"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Model'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <label className="block mb-2 text-sm font-medium">
              Environment Map (HDR/EXR):
            </label>
            <input
              type="file"
              accept=".hdr,.exr"
              onChange={handleEnvironmentChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-secondary file:text-secondary-foreground
                hover:file:bg-secondary/80 mb-2"
            />
            <Button
              variant="outline"
              onClick={handleUploadEnvironment}
              disabled={!environmentFile || isUploadingEnv}
              className="w-full"
            >
              {isUploadingEnv ? 'Uploading...' : 'Upload Environment'}
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-medium">Reflection Settings</h3>

          <div className="space-y-3">
            <div>
              <label className="flex items-center justify-between text-sm">
                <span>Exposure: {reflectionSettings.exposure.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={reflectionSettings.exposure}
                onChange={(e) => handleSettingChange('exposure', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm">
                <span>Shadow Intensity: {reflectionSettings.shadowIntensity.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={reflectionSettings.shadowIntensity}
                onChange={(e) => handleSettingChange('shadowIntensity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm">
                <span>Shadow Softness: {reflectionSettings.shadowSoftness.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={reflectionSettings.shadowSoftness}
                onChange={(e) => handleSettingChange('shadowSoftness', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm">Auto-rotate</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reflectionSettings.autoRotate as boolean}
                  onChange={(e) => handleSettingChange('autoRotate', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        {previewUrl ? (
          <div className="w-full h-[500px] bg-muted/50 rounded-lg overflow-hidden">
            <ModelViewerWrapper
              src={previewUrl}
              alt="3D Model Preview"
              environmentImage={environmentUrl || undefined}
              exposure={reflectionSettings.exposure}
              shadowIntensity={reflectionSettings.shadowIntensity}
              shadowSoftness={reflectionSettings.shadowSoftness}
              autoRotate={reflectionSettings.autoRotate as boolean}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">No model selected</p>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Model URL:</h3>
          <code className="text-sm break-all p-2 bg-background rounded block">
            {previewUrl}
          </code>
        </div>
      )}
    </div>
  );
}
