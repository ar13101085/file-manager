import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth-service';
import type { LoginCredentials, SignupCredentials } from '../api/auth-service';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  permissions: {
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
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasUsers: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  checkSetup: () => Promise<void>;
  hasPermission: (permission: keyof User['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsers, setHasUsers] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const hasExistingUsers = await authService.checkSetup();
      setHasUsers(hasExistingUsers);
    } catch (error) {
      console.error('Failed to check setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    if (response.isSuccess) {
      authService.setAuthData(response.data.token, response.data.user);
      setUser(response.data.user);
      navigate('/');
    } else {
      throw new Error(response.msg);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    const response = await authService.signup(credentials);
    if (response.isSuccess) {
      authService.setAuthData(response.data.token, response.data.user);
      setUser(response.data.user);
      setHasUsers(true);
      navigate('/');
    } else {
      throw new Error(response.msg);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    authService.clearAuthData();
    setUser(null);
    navigate('/login');
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    }
    authService.clearAuthData();
    setUser(null);
    navigate('/login');
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[permission] as boolean;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasUsers,
    login,
    signup,
    logout,
    logoutAll,
    checkSetup,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};