import React, { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog';
import { fileService } from '../../api/file-service';
import { useFileManager } from '../../contexts/FileManagerContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ open, onOpenChange, onComplete }) => {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentPath } = useFileManager();
  const toast = useToastContext();

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const apiPath = currentPath === '/' ? '' : currentPath.substring(1);
      await fileService.createDirectory({
        currentDir: apiPath,
        name: folderName.trim()
      });
      toast.success('Folder created successfully');
      onComplete();
      onOpenChange(false);
      setFolderName('');
    } catch (err) {
      setError('Failed to create folder');
      console.error('Create folder error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !creating) {
      handleCreate();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFolderName('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Folder name
          </label>
          <input
            id="folder-name"
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New folder"
            className={cn(
              "w-full px-3 py-2 text-sm rounded-lg",
              "border border-gray-300 bg-white",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              "dark:focus:ring-blue-500 dark:focus:border-blue-500"
            )}
            autoFocus
          />

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={creating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 bg-white border border-gray-300",
                "hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
                "dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600",
                "dark:hover:bg-gray-600 dark:focus:ring-gray-700",
                creating && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!folderName.trim() || creating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700",
                "focus:ring-4 focus:ring-blue-300",
                "dark:focus:ring-blue-800",
                (!folderName.trim() || creating) && "opacity-50 cursor-not-allowed"
              )}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};