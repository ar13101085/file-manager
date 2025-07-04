import React from 'react';
import { FileText, Upload, Download, Trash2, Edit3, FolderPlus, FolderInput, Archive } from 'lucide-react';
import type { UserPermissions } from '../../types/user.types';
import { cn } from '../../utils/cn';

interface PermissionsEditorProps {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
}

const permissionItems = [
  { key: 'canRead', label: 'Read Files', icon: FileText, description: 'View and list files' },
  { key: 'canUpload', label: 'Upload Files', icon: Upload, description: 'Upload new files' },
  { key: 'canDownload', label: 'Download Files', icon: Download, description: 'Download files' },
  { key: 'canDelete', label: 'Delete Files', icon: Trash2, description: 'Delete files and folders' },
  { key: 'canRename', label: 'Rename Files', icon: Edit3, description: 'Rename files and folders' },
  { key: 'canCreateFolder', label: 'Create Folders', icon: FolderPlus, description: 'Create new folders' },
  { key: 'canMove', label: 'Move Files', icon: FolderInput, description: 'Move files and folders' },
  { key: 'canArchive', label: 'Create Archives', icon: Archive, description: 'Create zip archives' },
];

export const PermissionsEditor: React.FC<PermissionsEditorProps> = ({ permissions, onChange }) => {
  const handleToggle = (key: keyof UserPermissions) => {
    onChange({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const handlePathChange = (type: 'allowedPaths' | 'deniedPaths', value: string) => {
    const paths = value.split('\n').filter(path => path.trim());
    onChange({
      ...permissions,
      [type]: paths,
    });
  };

  return (
    <div className="space-y-4">
      {/* File Operation Permissions */}
      <div className="grid grid-cols-2 gap-4">
        {permissionItems.map(({ key, label, icon: Icon, description }) => (
          <div
            key={key}
            className={cn(
              "p-3 border rounded-lg cursor-pointer transition-colors",
              permissions[key as keyof UserPermissions]
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            )}
            onClick={() => handleToggle(key as keyof UserPermissions)}
          >
            <div className="flex items-start">
              <div className={cn(
                "p-2 rounded-md mr-3",
                permissions[key as keyof UserPermissions]
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                  </h4>
                  <input
                    type="checkbox"
                    checked={permissions[key as keyof UserPermissions] as boolean}
                    onChange={() => {}}
                    className="ml-auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Path Restrictions */}
      <div className="border-t pt-4 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Path Restrictions
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Allowed Paths (one per line)
            </label>
            <textarea
              value={permissions.allowedPaths.join('\n')}
              onChange={(e) => handlePathChange('allowedPaths', e.target.value)}
              placeholder="/allowed/path&#10;/another/allowed"
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to allow all paths
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Denied Paths (one per line)
            </label>
            <textarea
              value={permissions.deniedPaths.join('\n')}
              onChange={(e) => handlePathChange('deniedPaths', e.target.value)}
              placeholder="/restricted/path&#10;/private"
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Takes precedence over allowed paths
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};