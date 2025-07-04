import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { key: 'Ctrl/Cmd + U', description: 'Upload files' },
  { key: 'Ctrl/Cmd + N', description: 'Create new folder' },
  { key: 'Ctrl/Cmd + A', description: 'Select all files' },
  { key: 'Delete', description: 'Delete selected files' },
  { key: 'F2', description: 'Rename selected file' },
  { key: 'Ctrl/Cmd + X', description: 'Move selected files' },
  { key: 'Ctrl/Cmd + Shift + Z', description: 'Create archive' },
  { key: 'Escape', description: 'Clear selection' },
];

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Keyboard Shortcuts
          </Dialog.Title>
          
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={() => onOpenChange(false)}
              className={cn(
                "w-full px-4 py-2 text-sm font-medium rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300",
                "dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              )}
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};