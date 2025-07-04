import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, File, Folder, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { fileService } from '../api/file-service';
import type { FileInfo } from '../types/file.types';
import { useFileManager } from '../contexts/FileManagerContext';
import { debounce } from '../utils/debounce';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const { currentPath, files, setFiles } = useFileManager();
  const [originalFiles, setOriginalFiles] = useState<FileInfo[]>([]);

  // Store original files when they change (not from search)
  useEffect(() => {
    if (query === '') {
      setOriginalFiles(files);
    }
  }, [files, query]);

  // Local search function for current folder
  const performLocalSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setFiles(originalFiles.length > 0 ? originalFiles : files);
    } else {
      const filesToSearch = originalFiles.length > 0 ? originalFiles : files;
      const filtered = filesToSearch.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFiles(filtered);
    }
  }, [originalFiles, files, setFiles]);

  // Debounced nested search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (searchQuery.length < 1) {
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      try {
        const searchResults = await fileService.searchFiles(
          searchQuery, 
          currentPath,
          abortController.signal
        );
        
        // Check if request was aborted
        if (!abortController.signal.aborted) {
          setResults(searchResults.slice(0, 30)); // Show up to 30 results
          setIsOpen(true);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setResults([]);
          setIsLoading(false);
        }
      }
    }, 300),
    [currentPath]
  );

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Perform local search immediately
    performLocalSearch(newQuery);
    
    // Perform nested search with debounce
    if (newQuery.trim()) {
      debouncedSearch(newQuery);
    } else {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    performLocalSearch('');
    inputRef.current?.focus();
  };

  // Reset search when path changes
  useEffect(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPath]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (file: FileInfo) => {
    if (file.isDirectory) {
      // Navigate to the directory
      navigate('/' + file.relativePath);
    } else {
      // Navigate to the parent directory of the file
      const parentPath = file.relativePath.split('/').slice(0, -1).join('/');
      navigate('/' + parentPath);
    }
    clearSearch();
  };

  const getParentPath = (relativePath: string) => {
    const parts = relativePath.split('/');
    return parts.slice(0, -1).join('/') || '/';
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="font-semibold text-blue-600 dark:text-blue-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search files and folders..."
          className={cn(
            "w-full pl-10 pr-10 py-2 text-sm",
            "bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600",
            "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
          )}
        />
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-1 py-1",
          "bg-white dark:bg-gray-800 rounded-lg shadow-lg",
          "border border-gray-200 dark:border-gray-700",
          "max-h-80 overflow-y-auto"
        )}>
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          ) : (
            results.map((file, index) => (
              <div
                key={file.relativePath}
                className="relative"
                onMouseEnter={() => setHoveredPath(file.relativePath)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <button
                  onClick={() => handleResultClick(file)}
                  className={cn(
                    "w-full px-4 py-2 text-left flex items-start gap-3",
                    "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {file.isDirectory ? (
                      <Folder className="w-4 h-4 text-blue-500" />
                    ) : (
                      <File className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {highlightMatch(file.name, query)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getParentPath(file.relativePath) || 'Root'}
                    </div>
                  </div>
                  {!file.isDirectory && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {file.size}
                    </div>
                  )}
                </button>
                
                {/* Animated full path tooltip */}
                {hoveredPath === file.relativePath && (
                  <div className={cn(
                    "absolute left-0 right-0 top-full mt-1",
                    "bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg",
                    "shadow-lg pointer-events-none",
                    "animate-in fade-in-0 slide-in-from-top-1 duration-200"
                  )}
                  style={{ zIndex: 9999 }}
                  >
                    <div className="font-mono break-all">
                      {file.relativePath || '/'}
                    </div>
                    <div className="absolute -top-1 left-8 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};