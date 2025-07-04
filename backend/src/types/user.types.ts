export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'user';
  permissions: UserPermissions;
  createdAt: Date;
  createdBy?: string; // admin who created this user
  lastLogin?: Date;
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
  // Path restrictions
  allowedPaths: string[]; // Empty array means access to all paths
  deniedPaths: string[]; // Explicitly denied paths
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  permissions?: Partial<UserPermissions>;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  permissions?: Partial<UserPermissions>;
  isActive?: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Session {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isBlacklisted: boolean;
}