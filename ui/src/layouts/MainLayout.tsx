import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BreadcrumbBar } from '../components/BreadcrumbBar';
import { FileActionsBar } from '../components/FileActionsBar';
import { FileTable } from '../components/FileTable';
import { useFileManager } from '../contexts/FileManagerContext';
import { fileService } from '../api/file-service';
import { Loader2 } from 'lucide-react';
import { UploadDialog } from '../components/dialogs/UploadDialog';
import { DeleteDialog } from '../components/dialogs/DeleteDialog';
import { RenameDialog } from '../components/dialogs/RenameDialog';
import { CreateFolderDialog } from '../components/dialogs/CreateFolderDialog';
import { ArchiveDialog } from '../components/dialogs/ArchiveDialog';
import { MoveDialog } from '../components/dialogs/MoveDialog';
import { STATIC_URL } from '../utils/config';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { DragDropOverlay } from '../components/DragDropOverlay';
import { UploadProgress } from '../components/UploadProgress';
import { useUploadManager } from '../hooks/useUploadManager';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    setFiles, 
    setCurrentPath, 
    currentPath, 
    setIsLoading, 
    setError,
    clearSelection,
    isLoading,
    error,
    selectedFiles
  } = useFileManager();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const uploadManager = useUploadManager();

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await fileService.getFiles(path);
      setFiles(files);
    } catch (error) {
      setError('Failed to load files');
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // React Router gives us the encoded pathname, we need to decode it
    const decodedPath = decodeURIComponent(location.pathname);
    const path = decodedPath === '/' ? '/' : decodedPath;
    setCurrentPath(path);
    // Remove leading slash for API call, except for root
    const apiPath = path === '/' ? '' : path.substring(1);
    loadFiles(apiPath);
    clearSelection();
  }, [location.pathname]);

  const refreshFiles = () => {
    const apiPath = currentPath === '/' ? '' : currentPath.substring(1);
    loadFiles(apiPath);
  };

  const handleUpload = () => {
    setUploadOpen(true);
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(true);
  };

  const handleDelete = () => {
    if (selectedFiles.length > 0) {
      setDeleteOpen(true);
    }
  };

  const handleRename = () => {
    if (selectedFiles.length === 1) {
      setRenameOpen(true);
    }
  };

  const handleMove = () => {
    if (selectedFiles.length > 0) {
      setMoveOpen(true);
    }
  };

  const handleArchive = () => {
    if (selectedFiles.length > 0) {
      setArchiveOpen(true);
    }
  };

  const handleDownload = () => {
    if (selectedFiles.length === 1 && !selectedFiles[0].isDirectory) {
      const encodedPath = encodeURI(selectedFiles[0].relativePath);
      window.open(`${STATIC_URL}/${encodedPath}`, '_blank');
    } else if (selectedFiles.length > 1) {
      // For multiple files, we could first create an archive and then download
      setArchiveOpen(true);
    }
  };

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onUpload: handleUpload,
    onCreateFolder: handleCreateFolder,
    onDelete: handleDelete,
    onRename: handleRename,
    onMove: handleMove,
    onArchive: handleArchive,
  });

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadManager.addUploads(files, currentPath, refreshFiles);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header />
      <BreadcrumbBar currentPath={currentPath} />
      <FileActionsBar
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        onDelete={handleDelete}
        onRename={handleRename}
        onMove={handleMove}
        onArchive={handleArchive}
        onDownload={handleDownload}
      />
      <main className="mx-auto max-w-screen-xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <FileTable 
            onRename={handleRename}
            onMove={handleMove}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        )}
      </main>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={refreshFiles}
        uploadManager={uploadManager}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onComplete={refreshFiles}
      />

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        onComplete={refreshFiles}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onComplete={refreshFiles}
      />

      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onComplete={refreshFiles}
      />

      <MoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        onComplete={refreshFiles}
      />

      <DragDropOverlay isDragging={isDragging} />
      
      {uploadManager.isVisible && (
        <UploadProgress
          uploads={uploadManager.uploads}
          onCancel={uploadManager.cancelUpload}
          onClose={() => uploadManager.setIsVisible(false)}
          onClearCompleted={uploadManager.clearCompleted}
        />
      )}
    </div>
  );
};