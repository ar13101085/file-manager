import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog';
import { fileService } from '../../api/file-service';
import { useFileManager } from '../../contexts/FileManagerContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const ArchiveDialog: React.FC<ArchiveDialogProps> = ({ open, onOpenChange, onComplete }) => {
  const [archiveName, setArchiveName] = useState('archive.zip');
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFiles, currentPath } = useFileManager();
  const toast = useToastContext();

  const handleArchive = async () => {
    if (!archiveName.trim()) return;

    setArchiving(true);
    setError(null);

    try {
      const paths = selectedFiles.map(file => file.relativePath);
      const apiPath = currentPath === '/' ? '' : currentPath.substring(1);
      await fileService.archiveFiles({
        paths,
        currentDir: apiPath,
        name: archiveName.trim()
      });
      toast.success('Archive created successfully');
      onComplete();
      onOpenChange(false);
      setArchiveName('archive.zip');
    } catch (err) {
      setError('Failed to create archive');
      console.error('Archive error:', err);
    } finally {
      setArchiving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !archiving) {
      handleArchive();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setArchiveName('archive.zip');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Archive</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Creating archive of {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''}
            </p>
          </div>

          <label htmlFor="archive-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Archive name
          </label>
          <input
            id="archive-name"
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
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

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={archiving}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 bg-white border border-gray-300",
                "hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
                "dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600",
                "dark:hover:bg-gray-600 dark:focus:ring-gray-700",
                archiving && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleArchive}
              disabled={!archiveName.trim() || archiving}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700",
                "focus:ring-4 focus:ring-blue-300",
                "dark:focus:ring-blue-800",
                (!archiveName.trim() || archiving) && "opacity-50 cursor-not-allowed"
              )}
            >
              {archiving ? 'Creating...' : 'Create Archive'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};