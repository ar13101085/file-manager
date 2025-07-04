import React from 'react';
import { Folder, File, FileText, FileImage, FileVideo, FileAudio, FileCode, FileArchive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import type { FileInfo } from '../types/file.types';
import { useFileManager } from '../contexts/FileManagerContext';
import { useToastContext } from '../contexts/ToastContext';
import { STATIC_URL } from '../utils/config';
import { FileContextMenu } from './ContextMenu';

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, React.ReactNode> = {
    // Images
    jpg: <FileImage className="w-5 h-5" />,
    jpeg: <FileImage className="w-5 h-5" />,
    png: <FileImage className="w-5 h-5" />,
    gif: <FileImage className="w-5 h-5" />,
    svg: <FileImage className="w-5 h-5" />,
    webp: <FileImage className="w-5 h-5" />,
    
    // Videos
    mp4: <FileVideo className="w-5 h-5" />,
    avi: <FileVideo className="w-5 h-5" />,
    mov: <FileVideo className="w-5 h-5" />,
    mkv: <FileVideo className="w-5 h-5" />,
    webm: <FileVideo className="w-5 h-5" />,
    
    // Audio
    mp3: <FileAudio className="w-5 h-5" />,
    wav: <FileAudio className="w-5 h-5" />,
    flac: <FileAudio className="w-5 h-5" />,
    ogg: <FileAudio className="w-5 h-5" />,
    
    // Code
    js: <FileCode className="w-5 h-5" />,
    ts: <FileCode className="w-5 h-5" />,
    jsx: <FileCode className="w-5 h-5" />,
    tsx: <FileCode className="w-5 h-5" />,
    py: <FileCode className="w-5 h-5" />,
    java: <FileCode className="w-5 h-5" />,
    cpp: <FileCode className="w-5 h-5" />,
    c: <FileCode className="w-5 h-5" />,
    html: <FileCode className="w-5 h-5" />,
    css: <FileCode className="w-5 h-5" />,
    
    // Documents
    pdf: <FileText className="w-5 h-5" />,
    doc: <FileText className="w-5 h-5" />,
    docx: <FileText className="w-5 h-5" />,
    txt: <FileText className="w-5 h-5" />,
    md: <FileText className="w-5 h-5" />,
    
    // Archives
    zip: <FileArchive className="w-5 h-5" />,
    rar: <FileArchive className="w-5 h-5" />,
    '7z': <FileArchive className="w-5 h-5" />,
    tar: <FileArchive className="w-5 h-5" />,
    gz: <FileArchive className="w-5 h-5" />,
  };

  return iconMap[ext || ''] || <File className="w-5 h-5" />;
};

interface FileTableProps {
  onRename: () => void;
  onMove: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

export const FileTable: React.FC<FileTableProps> = ({ onRename, onMove, onArchive, onDelete, onDownload }) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const { files, toggleFileSelection, selectAllFiles, clearSelection, selectedFiles, setFiles } = useFileManager();

  const allSelected = files.length > 0 && files.every(file => file.isSelected);
  const someSelected = selectedFiles.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllFiles();
    }
  };

  const handleFileClick = (file: FileInfo) => {
    if (file.isDirectory) {
      // Navigate to the path with leading slash for React Router
      navigate('/' + file.relativePath);
    } else {
      // For static file serving, encode the entire path for URL
      const encodedPath = encodeURI(file.relativePath);
      window.open(`${STATIC_URL}/${encodedPath}`, '_blank');
    }
  };

  const handleContextAction = (file: FileInfo, action: () => void) => {
    // If this file is not selected, select only this file
    if (!file.isSelected) {
      clearSelection();
      setFiles(files.map(f => ({ ...f, isSelected: f.relativePath === file.relativePath })));
      // Use setTimeout to ensure state update completes before action
      setTimeout(action, 0);
    } else {
      // File is already selected, just execute the action
      action();
    }
  };

  const handleCopyPath = (file: FileInfo) => {
    navigator.clipboard.writeText(file.relativePath);
    toast.success('Path copied to clipboard');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Size</th>
            <th scope="col" className="px-6 py-3">Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No files in this directory
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <FileContextMenu
                key={file.relativePath}
                file={file}
                onOpen={() => handleFileClick(file)}
                onDownload={() => handleContextAction(file, onDownload)}
                onRename={() => handleContextAction(file, onRename)}
                onMove={() => handleContextAction(file, onMove)}
                onArchive={() => handleContextAction(file, onArchive)}
                onDelete={() => handleContextAction(file, onDelete)}
                onCopyPath={() => handleCopyPath(file)}
              >
                <tr
                  className={cn(
                    "bg-white border-b dark:bg-gray-800 dark:border-gray-700",
                    "hover:bg-gray-50 dark:hover:bg-gray-600"
                  )}
                >
                  <td className="w-16 p-4">
                    <input
                      type="checkbox"
                      checked={file.isSelected || false}
                      onChange={() => toggleFileSelection(file)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td 
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="flex items-center space-x-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {file.isDirectory ? (
                        <Folder className="w-5 h-5 text-blue-500" />
                      ) : (
                        getFileIcon(file.name)
                      )}
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {file.isDirectory ? '-' : file.size}
                  </td>
                  <td className="px-6 py-4">
                    {file.creatingTime}
                  </td>
                </tr>
              </FileContextMenu>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};