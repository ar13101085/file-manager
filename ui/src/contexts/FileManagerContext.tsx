import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FileInfo } from '../types/file.types';

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
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};