import React, { useState, useEffect } from 'react';
import { FolderInput, Folder, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog';
import { fileService } from '../../api/file-service';
import { useFileManager } from '../../contexts/FileManagerContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import type { FileInfo } from '../../types/file.types';

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const MoveDialog: React.FC<MoveDialogProps> = ({ open, onOpenChange, onComplete }) => {
  const [targetPath, setTargetPath] = useState('/');
  const [directories, setDirectories] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFiles, currentPath } = useFileManager();
  const toast = useToastContext();

  const loadDirectories = async (path: string) => {
    setLoading(true);
    try {
      const apiPath = path === '/' ? '' : path.substring(1);
      const files = await fileService.getFiles(apiPath);
      setDirectories(files.filter(f => f.isDirectory));
    } catch (err) {
      console.error('Failed to load directories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTargetPath('/');
      loadDirectories('/');
      setError(null);
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    setTargetPath(path);
    loadDirectories(path);
  };

  const handleMove = async () => {
    if (targetPath === currentPath) {
      setError('Cannot move to the same directory');
      return;
    }

    setMoving(true);
    setError(null);

    try {
      const paths = selectedFiles.map(file => file.relativePath);
      const apiCurrentPath = currentPath === '/' ? '' : currentPath.substring(1);
      const apiTargetPath = targetPath === '/' ? '' : targetPath.substring(1);
      await fileService.moveFiles({
        paths,
        moveDir: apiTargetPath,
        currentDir: apiCurrentPath
      });
      toast.success('Files moved successfully');
      onComplete();
      onOpenChange(false);
    } catch (err) {
      setError('Failed to move files');
      console.error('Move error:', err);
    } finally {
      setMoving(false);
    }
  };

  const pathSegments = targetPath.split('/').filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Move Items</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Moving {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select destination
            </label>
            
            <div className="flex items-center gap-1 mb-3 text-sm">
              <button
                onClick={() => handleNavigate('/')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Home
              </button>
              {pathSegments.map((segment, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => handleNavigate('/' + pathSegments.slice(0, index + 1).join('/'))}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {segment}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : directories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No folders in this directory</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {directories.map((dir) => (
                    <button
                      key={dir.relativePath}
                      onClick={() => handleNavigate('/' + dir.relativePath)}
                      className={cn(
                        "w-full px-4 py-3 flex items-center gap-3 text-left",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        "transition-colors"
                      )}
                    >
                      <Folder className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">{dir.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={moving}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 bg-white border border-gray-300",
                "hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
                "dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600",
                "dark:hover:bg-gray-600 dark:focus:ring-gray-700",
                moving && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={moving || targetPath === currentPath}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700",
                "focus:ring-4 focus:ring-blue-300",
                "dark:focus:ring-blue-800",
                (moving || targetPath === currentPath) && "opacity-50 cursor-not-allowed"
              )}
            >
              {moving ? 'Moving...' : 'Move Here'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};