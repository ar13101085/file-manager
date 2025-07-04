import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Upload, FolderPlus, Download, Archive, Trash2, Edit3, FolderInput } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFileManager } from '@/contexts/FileManagerContext';
import { useAuth } from '@/contexts/AuthContext';

interface FileActionsBarMobileProps {
  onUpload: () => void;
  onCreateFolder: () => void;
  onDelete: () => void;
  onRename: () => void;
  onMove: () => void;
  onArchive: () => void;
  onDownload: () => void;
}

export const FileActionsBarMobile: React.FC<FileActionsBarMobileProps> = ({
  onUpload,
  onCreateFolder,
  onDelete,
  onRename,
  onMove,
  onArchive,
  onDownload,
}) => {
  const { selectedFiles } = useFileManager();
  const { hasPermission } = useAuth();
  const hasSelection = selectedFiles.length > 0;
  const singleSelection = selectedFiles.length === 1;

  return (
    <div className="flex items-center gap-2 sm:hidden">
      {hasPermission('canUpload') && (
        <button
          onClick={onUpload}
          className={cn(
            "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
            "text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
            "dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          )}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </button>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
              "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={cn(
              "z-50 min-w-[180px] overflow-hidden rounded-md border bg-white p-1 shadow-md",
              "dark:bg-gray-800 dark:border-gray-700",
              "animate-in fade-in-0 zoom-in-95"
            )}
            sideOffset={5}
          >
            {hasPermission('canCreateFolder') && (
              <DropdownMenu.Item
                onClick={onCreateFolder}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "focus:bg-gray-100 dark:focus:bg-gray-700"
                )}
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </DropdownMenu.Item>
            )}

            {hasPermission('canCreateFolder') && (hasPermission('canDownload') || hasPermission('canArchive') || 
             hasPermission('canRename') || hasPermission('canMove')) && (
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
            )}

            {hasPermission('canDownload') && (
              <DropdownMenu.Item
                onClick={onDownload}
                disabled={!hasSelection}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  hasSelection
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <Download className="w-4 h-4" />
                Download
              </DropdownMenu.Item>
            )}

            {hasPermission('canArchive') && (
              <DropdownMenu.Item
                onClick={onArchive}
                disabled={!hasSelection}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  hasSelection
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenu.Item>
            )}

            {hasPermission('canRename') && (
              <DropdownMenu.Item
                onClick={onRename}
                disabled={!singleSelection}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  singleSelection
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <Edit3 className="w-4 h-4" />
                Rename
              </DropdownMenu.Item>
            )}

            {hasPermission('canMove') && (
              <DropdownMenu.Item
                onClick={onMove}
                disabled={!hasSelection}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  hasSelection
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <FolderInput className="w-4 h-4" />
                Move
              </DropdownMenu.Item>
            )}

            {(hasPermission('canDownload') || hasPermission('canArchive') || 
              hasPermission('canRename') || hasPermission('canMove')) && hasPermission('canDelete') && (
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
            )}

            {hasPermission('canDelete') && (
              <DropdownMenu.Item
                onClick={onDelete}
                disabled={!hasSelection}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  hasSelection
                    ? "hover:bg-red-100 dark:hover:bg-red-900/20 focus:bg-red-100 dark:focus:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};