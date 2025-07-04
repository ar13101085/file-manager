import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../Dialog';
import { fileService } from '../../api/file-service';
import { useFileManager } from '../../contexts/FileManagerContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onOpenChange, onComplete }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFiles } = useFileManager();
  const toast = useToastContext();

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const paths = selectedFiles.map(file => file.relativePath);
      const results = await fileService.deleteFiles(paths);
      
      const failed = results.filter(r => !r.isSuccess);
      if (failed.length > 0) {
        toast.error(`Failed to delete ${failed.length} file(s)`);
        setError(`Failed to delete ${failed.length} file(s)`);
      } else {
        toast.success('Files deleted successfully');
        onComplete();
        onOpenChange(false);
      }
    } catch (err) {
      setError('Failed to delete files');
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Files</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the selected files.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {selectedFiles.length === 1
                  ? `Delete "${selectedFiles[0].name}"?`
                  : `Delete ${selectedFiles.length} items?`}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 bg-white border border-gray-300",
                "hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
                "dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600",
                "dark:hover:bg-gray-600 dark:focus:ring-gray-700",
                deleting && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-red-600 hover:bg-red-700",
                "focus:ring-4 focus:ring-red-300",
                "dark:focus:ring-red-900",
                deleting && "opacity-50 cursor-not-allowed"
              )}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};