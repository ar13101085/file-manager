import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
};

const iconColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm p-4 rounded-lg shadow-lg',
        'animate-in slide-in-from-right-full fade-in duration-300',
        'bg-white dark:bg-gray-800 border',
        type === 'success' && 'border-green-200 dark:border-green-800',
        type === 'error' && 'border-red-200 dark:border-red-800',
        type === 'info' && 'border-blue-200 dark:border-blue-800',
        type === 'warning' && 'border-yellow-200 dark:border-yellow-800'
      )}
    >
      <div className={cn('flex-shrink-0', iconColors[type])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        {message && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};