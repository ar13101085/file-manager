import React, { useState, useEffect } from 'react';
import { FolderOpen, Search, HelpCircle, User, LogOut, Users } from 'lucide-react';
import { useFileManager } from '../contexts/FileManagerContext';
import { useAuth } from '../contexts/AuthContext';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { Tooltip } from './ui/tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <SearchBar />
          
          <Tooltip content="Keyboard Shortcuts">
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Show keyboard shortcuts"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </Tooltip>
          
          {user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </button>
              </DropdownMenu.Trigger>
              
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className={cn(
                    "min-w-[180px] bg-white dark:bg-gray-800 rounded-md p-1 shadow-lg border border-gray-200 dark:border-gray-700",
                    "z-50"
                  )}
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Label className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </DropdownMenu.Label>
                  
                  <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenu.Item
                        onClick={() => navigate('/users')}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer",
                          "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                        )}
                      >
                        <Users className="w-4 h-4" />
                        Manage Users
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                    </>
                  )}
                  
                  <DropdownMenu.Item
                    onClick={logout}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm outline-none cursor-pointer",
                      "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm",
                      "text-red-600 dark:text-red-400"
                    )}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
      
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </header>
  );
};