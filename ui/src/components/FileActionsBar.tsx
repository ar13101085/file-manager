import React from 'react';
import { Upload, FolderPlus, Download, Archive, Trash2, Edit3, FolderInput } from 'lucide-react';
import { cn } from '../utils/cn';
import { useFileManager } from '../contexts/FileManagerContext';
import type { SortField, SortDirection } from '../contexts/FileManagerContext';
import { useAuth } from '../contexts/AuthContext';
import { FileActionsBarMobile } from './FileActionsBarMobile';

interface FileActionsBarProps {
  onUpload: () => void;
  onCreateFolder: () => void;
  onDelete: () => void;
  onRename: () => void;
  onMove: () => void;
  onArchive: () => void;
  onDownload: () => void;
}

export const FileActionsBar: React.FC<FileActionsBarProps> = ({
  onUpload,
  onCreateFolder,
  onDelete,
  onRename,
  onMove,
  onArchive,
  onDownload,
}) => {
  const { selectedFiles, sortField, setSortField, sortDirection, setSortDirection } = useFileManager();
  const { hasPermission } = useAuth();
  const hasSelection = selectedFiles.length > 0;
  const singleSelection = selectedFiles.length === 1;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        {/* Mobile view with dropdown */}
        <div className="sm:hidden">
          <FileActionsBarMobile
            onUpload={onUpload}
            onCreateFolder={onCreateFolder}
            onDelete={onDelete}
            onRename={onRename}
            onMove={onMove}
            onArchive={onArchive}
            onDownload={onDownload}
          />
        </div>
        
        {/* Desktop view with all buttons */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
        {hasPermission('canUpload') && (
          <button
            onClick={onUpload}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
              "dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            )}
          >
            <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Upload</span>
          </button>
        )}
        
        {hasPermission('canCreateFolder') && (
          <button
            onClick={onCreateFolder}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            )}
          >
            <FolderPlus className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>New Folder</span>
          </button>
        )}

        {(hasPermission('canUpload') || hasPermission('canCreateFolder')) && 
         (hasPermission('canDownload') || hasPermission('canArchive') || 
          hasPermission('canRename') || hasPermission('canMove') || hasPermission('canDelete')) && (
          <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600" />
        )}

        {hasPermission('canDownload') && (
          <button
            onClick={onDownload}
            disabled={!hasSelection}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-gray-900 bg-white border border-gray-300",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:focus:ring-gray-700",
              hasSelection
                ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Download</span>
          </button>
        )}

        {hasPermission('canArchive') && (
          <button
            onClick={onArchive}
            disabled={!hasSelection}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-gray-900 bg-white border border-gray-300",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:focus:ring-gray-700",
              hasSelection
                ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Archive className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Archive</span>
          </button>
        )}

        {hasPermission('canRename') && (
          <button
            onClick={onRename}
            disabled={!singleSelection}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-gray-900 bg-white border border-gray-300",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:focus:ring-gray-700",
              singleSelection
                ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Edit3 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Rename</span>
            <span className="sm:hidden">Ren</span>
          </button>
        )}

        {hasPermission('canMove') && (
          <button
            onClick={onMove}
            disabled={!hasSelection}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-gray-900 bg-white border border-gray-300",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:focus:ring-gray-700",
              hasSelection
                ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <FolderInput className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Move</span>
          </button>
        )}

        {hasPermission('canDelete') && (
          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap",
              "text-white bg-red-600 focus:ring-4",
              hasSelection
                ? "hover:bg-red-700 focus:ring-red-300 dark:hover:bg-red-700 dark:focus:ring-red-900"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Delete</span>
          </button>
        )}
        
        {/* Separator before sort options */}
        <div className="flex-1" />
        
        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
              setSortField(field);
              setSortDirection(direction);
            }}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg",
              "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100",
              "focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white",
              "dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
              "cursor-pointer"
            )}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="size-asc">Size (Smallest)</option>
            <option value="size-desc">Size (Largest)</option>
            <option value="creatingTime-asc">Date (Oldest)</option>
            <option value="creatingTime-desc">Date (Newest)</option>
            <option value="extension-asc">Extension (A-Z)</option>
            <option value="extension-desc">Extension (Z-A)</option>
          </select>
        </div>
      </div>
      </div>
    </div>
  );
};