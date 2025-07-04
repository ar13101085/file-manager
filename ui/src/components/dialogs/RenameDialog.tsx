import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog';
import { fileService } from '../../api/file-service';
import { useFileManager } from '../../contexts/FileManagerContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({ open, onOpenChange, onComplete }) => {
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFiles } = useFileManager();
  const toast = useToastContext();

  const fileToRename = selectedFiles[0];

  useEffect(() => {
    if (open && fileToRename) {
      setNewName(fileToRename.name);
      setError(null);
    }
  }, [open, fileToRename]);

  const handleRename = async () => {
    if (!newName.trim() || !fileToRename) return;

    setRenaming(true);
    setError(null);

    try {
      const results = await fileService.renameFiles({
        paths: [fileToRename.relativePath],
        name: newName.trim()
      });
      
      if (results[0]?.isSuccess) {
        toast.success('File renamed successfully');
        onComplete();
        onOpenChange(false);
        setNewName('');
      } else {
        toast.error(results[0]?.msg || 'Failed to rename file');
        setError(results[0]?.msg || 'Failed to rename file');
      }
    } catch (err) {
      setError('Failed to rename file');
      console.error('Rename error:', err);
    } finally {
      setRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !renaming) {
      handleRename();
    }
  };

  if (!fileToRename) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {fileToRename.isDirectory ? 'Folder' : 'File'}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current name
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fileToRename.name}
              </p>
            </div>

            <div>
              <label htmlFor="new-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New name
              </label>
              <input
                id="new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg",
                  "border border-gray-300 bg-white",
                  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                  "dark:focus:ring-blue-500 dark:focus:border-blue-500"
                )}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={renaming}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 bg-white border border-gray-300",
                "hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
                "dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600",
                "dark:hover:bg-gray-600 dark:focus:ring-gray-700",
                renaming && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              disabled={!newName.trim() || newName === fileToRename.name || renaming}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700",
                "focus:ring-4 focus:ring-blue-300",
                "dark:focus:ring-blue-800",
                (!newName.trim() || newName === fileToRename.name || renaming) && "opacity-50 cursor-not-allowed"
              )}
            >
              {renaming ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};