import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Download, Edit3, FolderInput, Archive, Trash2, Copy, FolderOpen } from 'lucide-react';
import { cn } from '../utils/cn';
import type { FileInfo } from '../types/file.types';

interface ContextMenuProps {
  children: React.ReactNode;
  file: FileInfo;
  onOpen?: () => void;
  onDownload?: () => void;
  onRename?: () => void;
  onMove?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onCopyPath?: () => void;
}

export const FileContextMenu: React.FC<ContextMenuProps> = ({
  children,
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onArchive,
  onDelete,
  onCopyPath,
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-md border bg-white p-1 shadow-md",
            "dark:bg-gray-800 dark:border-gray-700"
          )}
          sideOffset={5}
        >
          {file.isDirectory && (
            <ContextMenu.Item
              onClick={onOpen}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:bg-gray-100 dark:focus:bg-gray-700"
              )}
            >
              <FolderOpen className="w-4 h-4" />
              Open
            </ContextMenu.Item>
          )}

          {!file.isDirectory && (
            <ContextMenu.Item
              onClick={onDownload}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:bg-gray-100 dark:focus:bg-gray-700"
              )}
            >
              <Download className="w-4 h-4" />
              Download
            </ContextMenu.Item>
          )}

          <ContextMenu.Item
            onClick={onRename}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:bg-gray-100 dark:focus:bg-gray-700"
            )}
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={onMove}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:bg-gray-100 dark:focus:bg-gray-700"
            )}
          >
            <FolderInput className="w-4 h-4" />
            Move
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={onCopyPath}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:bg-gray-100 dark:focus:bg-gray-700"
            )}
          >
            <Copy className="w-4 h-4" />
            Copy Path
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          <ContextMenu.Item
            onClick={onArchive}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:bg-gray-100 dark:focus:bg-gray-700"
            )}
          >
            <Archive className="w-4 h-4" />
            Create Archive
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          <ContextMenu.Item
            onClick={onDelete}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              "hover:bg-red-100 dark:hover:bg-red-900/20",
              "focus:bg-red-100 dark:focus:bg-red-900/20",
              "text-red-600 dark:text-red-400"
            )}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};