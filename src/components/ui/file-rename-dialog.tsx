'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface FileRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
  onRename: (newName: string) => Promise<boolean>;
}

export function FileRenameDialog({ open, onOpenChange, currentPath, onRename }: FileRenameDialogProps) {
  console.log('FileRenameDialog rendered with:', { open, currentPath });
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reset the form when the dialog is opened/closed or the path changes
  useEffect(() => {
    if (open) {
      const currentFileName = currentPath.split('/').pop() || '';
      const fileNameWithoutExt = currentFileName.includes('.') 
        ? currentFileName.split('.').slice(0, -1).join('.')
        : currentFileName;
      setNewName(fileNameWithoutExt);
      setError('');
      console.log('Dialog opened with file:', fileNameWithoutExt);
    } else {
      console.log('Dialog closed');
    }
  }, [open, currentPath]);

  // Extract the current file name without extension
  const currentFileName = currentPath.split('/').pop() || '';
  const fileNameWithoutExt = currentFileName.includes('.') 
    ? currentFileName.split('.').slice(0, -1).join('.')
    : currentFileName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Please enter a file name');
      return;
    }

    // Basic validation
    if (!/^[\w\-. ]+$/.test(newName)) {
      setError('Invalid file name. Use only letters, numbers, spaces, hyphens, underscores, and periods.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const success = await onRename(newName);
      if (success) {
        setNewName('');
        onOpenChange(false);
      }
    } catch (err) {
      setError('Failed to rename file. Please try again.');
      console.error('Error renaming file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Rename the file. The file extension will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                New Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={fileNameWithoutExt}
                className="col-span-3"
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename File'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
