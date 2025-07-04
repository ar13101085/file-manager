import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { FileInfo } from '../types/file.types';

export type SortField = 'name' | 'size' | 'creatingTime' | 'extension';
export type SortDirection = 'asc' | 'desc';

interface FileManagerContextType {
  files: FileInfo[];
  setFiles: (files: FileInfo[]) => void;
  selectedFiles: FileInfo[];
  toggleFileSelection: (file: FileInfo) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  sortedFiles: FileInfo[];
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within FileManagerProvider');
  }
  return context;
};

interface FileManagerProviderProps {
  children: ReactNode;
}

export const FileManagerProvider: React.FC<FileManagerProviderProps> = ({ children }) => {
  const [files, setFilesState] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const setFiles = useCallback((newFiles: FileInfo[]) => {
    setFilesState(newFiles.map(file => ({ ...file, isSelected: false })));
  }, []);

  const selectedFiles = files.filter(file => file.isSelected);

  const toggleFileSelection = useCallback((file: FileInfo) => {
    setFilesState(prevFiles =>
      prevFiles.map(f =>
        f.relativePath === file.relativePath
          ? { ...f, isSelected: !f.isSelected }
          : f
      )
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    setFilesState(prevFiles =>
      prevFiles.map(file => ({ ...file, isSelected: true }))
    );
  }, []);

  const clearSelection = useCallback(() => {
    setFilesState(prevFiles =>
      prevFiles.map(file => ({ ...file, isSelected: false }))
    );
  }, []);

  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          // Use numeric sizeBytes for proper sorting
          aValue = a.sizeBytes || 0;
          bValue = b.sizeBytes || 0;
          break;
        case 'creatingTime':
          aValue = new Date(a.creatingTime).getTime();
          bValue = new Date(b.creatingTime).getTime();
          break;
        case 'extension':
          // For folders, use empty string as extension
          aValue = a.isDirectory ? '' : (a.name.split('.').pop() || '').toLowerCase();
          bValue = b.isDirectory ? '' : (b.name.split('.').pop() || '').toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      // Always put directories first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      
      // Then sort by the selected field
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [files, sortField, sortDirection]);

  const value: FileManagerContextType = {
    files,
    setFiles,
    selectedFiles,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    currentPath,
    setCurrentPath,
    isLoading,
    setIsLoading,
    error,
    setError,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    sortedFiles,
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};