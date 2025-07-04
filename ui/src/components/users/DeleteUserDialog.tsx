import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { adminService } from '../../api/admin-service';
import { cn } from '../../utils/cn';
import type { User } from '../../types/user.types';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}) => {
  const toast = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== user.username) {
      toast.error('Please type the username correctly to confirm');
      return;
    }

    setIsLoading(true);
    try {
      await adminService.deleteUser(user.id);
      toast.success('User deleted successfully');
      onSuccess();
      onOpenChange(false);
      setConfirmText('');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setConfirmText('');
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <Dialog.Title className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              Delete User
            </Dialog.Title>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete the user <strong>{user.username}</strong>?
              This action cannot be undone.
            </p>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mt-3">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Warning:</strong> All user data and permissions will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <strong>{user.username}</strong> to confirm
            </label>
            <input
              id="confirmUsername"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={user.username}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading || confirmText !== user.username}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};