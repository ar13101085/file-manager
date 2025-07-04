import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userDb, permissionDb } from '../config/database';
import { User, UserPermissions, CreateUserDto, UpdateUserDto } from '../types/user.types';

export class UserModel {
  // Default permissions for regular users
  static defaultUserPermissions: UserPermissions = {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canUpload: false,
    canDownload: true,
    canCreateFolder: false,
    canRename: false,
    canMove: false,
    canArchive: false,
    allowedPaths: [],
    deniedPaths: []
  };

  // Default permissions for admin users
  static defaultAdminPermissions: UserPermissions = {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canUpload: true,
    canDownload: true,
    canCreateFolder: true,
    canRename: true,
    canMove: true,
    canArchive: true,
    allowedPaths: [],
    deniedPaths: []
  };

  static async create(data: CreateUserDto, createdBy?: string): Promise<User> {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user: User = {
      id: userId,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'user',
      permissions: data.permissions 
        ? { ...(data.role === 'admin' ? this.defaultAdminPermissions : this.defaultUserPermissions), ...data.permissions }
        : (data.role === 'admin' ? this.defaultAdminPermissions : this.defaultUserPermissions),
      createdAt: new Date(),
      createdBy,
      isActive: true
    };

    await userDb.put(userId, JSON.stringify(user));
    await userDb.put(`username:${user.username}`, userId); // Index for username lookup
    await userDb.put(`email:${user.email}`, userId); // Index for email lookup
    
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    try {
      const userStr = await userDb.get(id);
      const user = JSON.parse(userStr);
      // Ensure all fields are present
      if (!user || typeof user !== 'object') {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  static async findByUsername(username: string): Promise<User | null> {
    try {
      const userId = await userDb.get(`username:${username.toLowerCase()}`);
      return await this.findById(userId);
    } catch (error) {
      return null;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const userId = await userDb.get(`email:${email.toLowerCase()}`);
      return await this.findById(userId);
    } catch (error) {
      return null;
    }
  }

  static async update(id: string, data: UpdateUserDto): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    // Create a copy of the user to update
    const updatedUser: User = { ...user };

    // Update email if provided
    if (data.email && data.email !== user.email) {
      await userDb.del(`email:${user.email}`);
      await userDb.put(`email:${data.email.toLowerCase()}`, id);
      updatedUser.email = data.email.toLowerCase();
    }

    // Update password only if explicitly provided
    if (data.password && data.password.length > 0) {
      updatedUser.password = await bcrypt.hash(data.password, 10);
    }

    // Update role if provided
    if (data.role !== undefined) {
      updatedUser.role = data.role;
    }

    // Update isActive if provided
    if (data.isActive !== undefined) {
      updatedUser.isActive = data.isActive;
    }

    // Update permissions if provided
    if (data.permissions) {
      updatedUser.permissions = { ...user.permissions, ...data.permissions };
    }

    // Save the updated user
    await userDb.put(id, JSON.stringify(updatedUser));
    return updatedUser;
  }

  static async delete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;

    await userDb.del(id);
    await userDb.del(`username:${user.username}`);
    await userDb.del(`email:${user.email}`);
    
    return true;
  }

  static async getAllUsers(): Promise<User[]> {
    const users: User[] = [];
    
    for await (const [key, value] of userDb.iterator()) {
      // Skip index entries
      if (!key.includes(':')) {
        users.push(JSON.parse(value));
      }
    }
    
    return users;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      if (!user.password || !password) {
        return false;
      }
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      return false;
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      user.lastLogin = new Date();
      await userDb.put(id, JSON.stringify(user));
    }
  }

  static async hasPermission(userId: string, permission: keyof UserPermissions, path?: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.isActive) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check basic permission
    const hasBasicPermission = user.permissions[permission] as boolean;
    if (!hasBasicPermission) return false;

    // If path is provided, check path restrictions
    if (path) {
      // Check denied paths first
      if (user.permissions.deniedPaths.some(deniedPath => 
        path.startsWith(deniedPath)
      )) {
        return false;
      }

      // If allowedPaths is empty, allow all paths (except denied)
      if (user.permissions.allowedPaths.length === 0) {
        return true;
      }

      // Check if path is in allowed paths
      return user.permissions.allowedPaths.some(allowedPath => 
        path.startsWith(allowedPath)
      );
    }

    return hasBasicPermission;
  }
}