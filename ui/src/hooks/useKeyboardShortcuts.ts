import { useEffect } from 'react';
import { useFileManager } from '../contexts/FileManagerContext';

interface ShortcutHandlers {
  onUpload?: () => void;
  onCreateFolder?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onMove?: () => void;
  onArchive?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const { selectedFiles, selectAllFiles, clearSelection } = useFileManager();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const isInputActive = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';
      
      // Cmd/Ctrl + A - Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInputActive) {
        e.preventDefault();
        selectAllFiles();
        return;
      }

      // Escape - Clear Selection
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        // Also close any open dialogs
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
        return;
      }

      // Cmd/Ctrl + U - Upload
      if ((e.metaKey || e.ctrlKey) && e.key === 'u' && !isInputActive) {
        e.preventDefault();
        handlers.onUpload?.();
        return;
      }

      // Cmd/Ctrl + Shift + N - New Folder
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n' && !isInputActive) {
        e.preventDefault();
        handlers.onCreateFolder?.();
        return;
      }

      // Delete/Backspace - Delete (when files selected)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFiles.length > 0 && !isInputActive) {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }

      // Cmd/Ctrl + R - Rename (when single file selected)
      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && selectedFiles.length === 1 && !isInputActive) {
        e.preventDefault();
        handlers.onRename?.();
        return;
      }

      // Cmd/Ctrl + M - Move (when files selected)
      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && selectedFiles.length > 0 && !isInputActive) {
        e.preventDefault();
        handlers.onMove?.();
        return;
      }

      // Cmd/Ctrl + Shift + Z - Archive (when files selected)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z' && selectedFiles.length > 0 && !isInputActive) {
        e.preventDefault();
        handlers.onArchive?.();
        return;
      }

      // Cmd/Ctrl + F - Focus Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFiles, selectAllFiles, clearSelection, handlers]);
};