export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canUpload: boolean;
  canDownload: boolean;
  canCreateFolder: boolean;
  canRename: boolean;
  canMove: boolean;
  canArchive: boolean;
  allowedPaths: string[];
  deniedPaths: string[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  permissions?: Partial<UserPermissions>;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  permissions?: Partial<UserPermissions>;
  isActive?: boolean;
}