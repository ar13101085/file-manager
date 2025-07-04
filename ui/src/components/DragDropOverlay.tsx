import React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-4 md:inset-8 lg:inset-16 border-4 border-dashed border-blue-500 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-2xl font-semibold text-white mb-2">Drop files here</p>
          <p className="text-gray-300">Release to upload files to current folder</p>
        </div>
      </div>
    </div>
  );
};