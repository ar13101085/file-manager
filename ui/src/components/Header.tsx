import React, { useState, useEffect } from 'react';
import { FolderOpen, Search } from 'lucide-react';
import { useFileManager } from '../contexts/FileManagerContext';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { files, setFiles } = useFileManager();
  const [originalFiles, setOriginalFiles] = useState(files);

  useEffect(() => {
    // Store original files when they change (not from search)
    if (searchQuery === '') {
      setOriginalFiles(files);
    }
  }, [files, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFiles(originalFiles);
    } else {
      const filtered = originalFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      setFiles(filtered);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-xl flex items-center justify-between px-4 py-3 mx-auto">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            File Manager
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search files..."
            />
          </div>
        </div>
      </div>
    </header>
  );
};