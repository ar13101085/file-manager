import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

interface BreadcrumbBarProps {
  currentPath: string;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ currentPath }) => {
  const navigate = useNavigate();
  
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  const handleNavigate = (index: number) => {
    if (index === -1) {
      navigate('/');
    } else {
      const newPath = '/' + pathSegments.slice(0, index + 1).join('/');
      navigate(newPath);
    }
  };

  return (
    <nav className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <ol className="flex items-center space-x-1">
        <li>
          <button
            onClick={() => handleNavigate(-1)}
            className={cn(
              "inline-flex items-center text-sm font-medium",
              "text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </button>
        </li>
        
        {pathSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <button
                onClick={() => handleNavigate(index)}
                className={cn(
                  "text-sm font-medium",
                  index === pathSegments.length - 1
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                {segment}
              </button>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};