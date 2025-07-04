import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { fileService } from '@/api/file-service';
import { useToastContext } from '@/contexts/ToastContext';
import type { UploadItem } from '@/components/UploadProgress';

export const useUploadManager = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const toast = useToastContext();

  const addUploads = useCallback((files: File[], currentPath: string, onComplete?: () => void) => {
    const newUploads: UploadItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setUploads(prev => [...prev, ...newUploads]);
    setIsVisible(true);

    // Start uploading each file
    newUploads.forEach(upload => {
      uploadFile(upload, currentPath, onComplete);
    });
  }, []);

  const uploadFile = async (upload: UploadItem, currentPath: string, onComplete?: () => void) => {
    const abortController = new AbortController();
    abortControllersRef.current.set(upload.id, abortController);

    // Update status to uploading
    setUploads(prev => prev.map(u => 
      u.id === upload.id ? { ...u, status: 'uploading' as const } : u
    ));

    try {
      await fileService.uploadFiles(
        [upload.file],
        currentPath === '/' ? '' : currentPath.substring(1),
        (progress) => {
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress } : u
          ));
        },
        abortController.signal
      );

      // Update status to completed
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'completed' as const, progress: 100 } : u
      ));

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }

      // Check if all uploads are complete
      setUploads(prev => {
        const allComplete = prev.every(u => u.status === 'completed' || u.status === 'error' || u.status === 'cancelled');
        if (allComplete && prev.length > 0) {
          const errors = prev.filter(u => u.status === 'error').length;
          if (errors > 0) {
            toast.warning(`Upload complete with ${errors} error${errors !== 1 ? 's' : ''}`);
          } else {
            toast.success('All uploads completed successfully');
          }
        }
        return prev;
      });
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'cancelled' as const } : u
        ));
      } else {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { 
            ...u, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : u
        ));
      }
    } finally {
      abortControllersRef.current.delete(upload.id);
    }
  };

  const cancelUpload = useCallback((id: string) => {
    const abortController = abortControllersRef.current.get(id);
    if (abortController) {
      abortController.abort();
    }
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    // Cancel all active uploads
    abortControllersRef.current.forEach(abortController => {
      abortController.abort();
    });
    abortControllersRef.current.clear();
    setUploads([]);
    setIsVisible(false);
  }, []);

  return {
    uploads,
    isVisible,
    setIsVisible,
    addUploads,
    cancelUpload,
    clearCompleted,
    clearAll,
  };
};