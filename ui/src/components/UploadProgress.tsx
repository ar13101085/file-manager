import React from 'react';
import { X, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  cancelToken?: () => void;
}

interface UploadProgressProps {
  uploads: UploadItem[];
  onCancel: (id: string) => void;
  onClose: () => void;
  onClearCompleted: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onCancel,
  onClose,
  onClearCompleted,
}) => {
  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'pending');
  const completedUploads = uploads.filter(u => u.status === 'completed');
  const hasErrors = uploads.some(u => u.status === 'error');

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {activeUploads.length > 0 
              ? `Uploading ${activeUploads.length} file${activeUploads.length !== 1 ? 's' : ''}`
              : 'Uploads complete'
            }
          </h3>
          {hasErrors && (
            <span className="text-xs text-red-600 dark:text-red-400">Some errors occurred</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {completedUploads.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear completed
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(upload.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {upload.file.name}
                  </p>
                  {(upload.status === 'uploading' || upload.status === 'pending') && (
                    <button
                      onClick={() => onCancel(upload.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {upload.status === 'uploading' && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mb-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {upload.progress}% • {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                )}
                
                {upload.status === 'error' && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {upload.error || 'Upload failed'}
                  </p>
                )}
                
                {upload.status === 'completed' && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Upload complete
                  </p>
                )}
                
                {upload.status === 'cancelled' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cancelled
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};